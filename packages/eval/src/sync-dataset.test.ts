import { describe, test, expect } from "bun:test";
import type { Example, ExampleCreate, ExampleUpdate } from "langsmith/schemas";

import {
  ATTACHMENT_KEY,
  syncDataset,
  type ReadPhoto,
  type SyncClient,
} from "./sync-dataset";
import { DATASET_NAME, type Solution } from "./types";

type FakeCalls = {
  createDataset: Array<[string, { description?: string } | undefined]>;
  createExamples: ExampleCreate[][];
  updateExample: ExampleUpdate[];
};

type FakeOpts = {
  hasDataset: boolean;
  datasetId: string;
  existing: Example[];
};

function makeFakeClient(opts: FakeOpts): { client: SyncClient; calls: FakeCalls } {
  const calls: FakeCalls = {
    createDataset: [],
    createExamples: [],
    updateExample: [],
  };
  const client: SyncClient = {
    async hasDataset() {
      return opts.hasDataset;
    },
    async readDataset() {
      return { id: opts.datasetId };
    },
    async createDataset(name, dsOpts) {
      calls.createDataset.push([name, dsOpts]);
      return { id: opts.datasetId };
    },
    listExamples() {
      const items = opts.existing;
      return (async function* () {
        for (const ex of items) yield ex;
      })();
    },
    async createExamples(uploads) {
      calls.createExamples.push(uploads);
      return [];
    },
    async updateExample(update) {
      calls.updateExample.push(update);
      return {};
    },
  };
  return { client, calls };
}

const fakeReadPhoto: ReadPhoto = async (file: string) => {
  // distinguishable per-file bytes for assertion
  return new Uint8Array([0xff, 0xd8, file.charCodeAt(0)]);
};

function makeExample(
  file: string,
  name: string,
  volume: number,
  options: {
    withAttachment?: boolean;
    inputs?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  } = {},
): Example {
  return {
    id: `ex-${file}`,
    inputs: options.inputs ?? {},
    outputs: { name, volume },
    ...(options.metadata ? { metadata: options.metadata } : { metadata: { source_file: file } }),
    ...(options.withAttachment
      ? {
          attachments: {
            [ATTACHMENT_KEY]: { presigned_url: `https://example.test/${file}` },
          },
        }
      : {}),
  } as unknown as Example;
}

describe("syncDataset", () => {
  test("creates the dataset when missing and uploads all rows with attachments", async () => {
    const { client, calls } = makeFakeClient({
      hasDataset: false,
      datasetId: "ds-new",
      existing: [],
    });
    const labeled: Solution[] = [
      { file: "a.jpg", name: "Aperol", volume: 0.5 },
      { file: "b.jpg", name: "Campari", volume: 0.7 },
      { file: "c.jpg", name: "Angostura Bitters", volume: 0.3 },
    ];

    const report = await syncDataset(labeled, {
      client,
      readPhoto: fakeReadPhoto,
    });
    
    expect(calls.createDataset).toHaveLength(1);
    expect(calls.createDataset[0]?.[0]).toBe(DATASET_NAME);

    expect(calls.createExamples).toHaveLength(1);
    const created = calls.createExamples[0]!;
    expect(created).toHaveLength(3);
    for (const sol of labeled) {
      const found = created.find(
        (c) => (c.metadata as { source_file?: string }).source_file === sol.file,
      );
      expect(found).toBeDefined();
      expect(found?.inputs).toEqual({});
      expect(found?.metadata).toEqual({ source_file: sol.file });
      expect(found?.outputs).toEqual({ name: sol.name, volume: sol.volume });
      expect(found?.dataset_id).toBe("ds-new");
      const att = (found?.attachments ?? {}) as Record<
        string,
        { mimeType: string; data: Uint8Array }
      >;
      const photo = att[ATTACHMENT_KEY];
      expect(photo).toBeDefined();
      expect(photo?.mimeType).toBe("image/jpeg");
      expect(Array.from(photo!.data)).toEqual([0xff, 0xd8, sol.file.charCodeAt(0)]);
    }

    expect(calls.updateExample).toHaveLength(0);
    expect(report).toEqual({
      datasetId: "ds-new",
      created: 3,
      updated: 0,
      unchanged: 0,
    });
  });

  test("no-ops when every existing example matches the labeled outputs", async () => {
    const existing = [
      makeExample("a.jpg", "Aperol", 0.5, {
        withAttachment: true,
      }),
      makeExample("b.jpg", "Campari", 0.7, {
        withAttachment: true,
      }),
    ];
    const { client, calls } = makeFakeClient({
      hasDataset: true,
      datasetId: "ds-1",
      existing,
    });
    const labeled: Solution[] = [
      { file: "a.jpg", name: "Aperol", volume: 0.5 },
      { file: "b.jpg", name: "Campari", volume: 0.7 },
    ];

    const report = await syncDataset(labeled, {
      client,
      readPhoto: fakeReadPhoto,
    });

    expect(calls.createDataset).toHaveLength(0);
    expect(calls.createExamples).toHaveLength(0);
    expect(calls.updateExample).toHaveLength(0);
    expect(report).toEqual({
      datasetId: "ds-1",
      created: 0,
      updated: 0,
      unchanged: 2,
    });
  });

  test("updates outputs in place when label drifts and never re-uploads attachments", async () => {
    const existing = [
      makeExample("a.jpg", "OldName", 0.5, {
        withAttachment: true,
      }),
    ];
    const { client, calls } = makeFakeClient({
      hasDataset: true,
      datasetId: "ds-1",
      existing,
    });
    const labeled: Solution[] = [{ file: "a.jpg", name: "Aperol", volume: 0.6 }];

    const report = await syncDataset(labeled, {
      client,
      readPhoto: fakeReadPhoto,
    });

    expect(calls.createExamples).toHaveLength(0);
    expect(calls.updateExample).toHaveLength(1);
    const update = calls.updateExample[0]!;
    expect(update.id).toBe("ex-a.jpg");
    expect(update.inputs).toEqual({});
    expect(update.metadata).toEqual({ source_file: "a.jpg" });
    expect(update.outputs).toEqual({ name: "Aperol", volume: 0.6 });
    expect((update as { attachments?: unknown }).attachments).toBeUndefined();
    expect(report).toEqual({
      datasetId: "ds-1",
      created: 0,
      updated: 1,
      unchanged: 0,
    });
  });

  test("migrates legacy rows to metadata.source_file and backfills missing attachments", async () => {
    const existing = [
      makeExample("a.jpg", "Aperol", 0.5, {
        inputs: { file: "a.jpg", possible_bottle_names: ["legacy"] },
        metadata: {},
      }),
    ];
    const { client, calls } = makeFakeClient({
      hasDataset: true,
      datasetId: "ds-1",
      existing,
    });
    const labeled: Solution[] = [{ file: "a.jpg", name: "Aperol", volume: 0.5 }];

    const report = await syncDataset(labeled, {
      client,
      readPhoto: fakeReadPhoto,
    });

    expect(calls.createExamples).toHaveLength(0);
    expect(calls.updateExample).toHaveLength(1);
    expect(calls.updateExample[0]?.inputs).toEqual({});
    expect(calls.updateExample[0]?.metadata).toEqual({ source_file: "a.jpg" });
    expect(calls.updateExample[0]?.attachments).toBeDefined();
    expect(report).toEqual({
      datasetId: "ds-1",
      created: 0,
      updated: 1,
      unchanged: 0,
    });
  });

  test("mixed: 1 unchanged + 1 update + 1 new — readPhoto invoked once", async () => {
    const existing = [
      makeExample("a.jpg", "Aperol", 0.5, {
        withAttachment: true,
      }),
      makeExample("b.jpg", "WrongName", 0.5, {
        withAttachment: true,
      }),
    ];
    const { client, calls } = makeFakeClient({
      hasDataset: true,
      datasetId: "ds-1",
      existing,
    });
    const labeled: Solution[] = [
      { file: "a.jpg", name: "Aperol", volume: 0.5 }, // unchanged
      { file: "b.jpg", name: "Campari", volume: 0.5 }, // updated
      { file: "c.jpg", name: "Angostura Bitters", volume: 0.3 }, // new
    ];

    let readPhotoCalls = 0;
    const countingReadPhoto: ReadPhoto = async (file: string) => {
      readPhotoCalls += 1;
      return fakeReadPhoto(file);
    };

    const report = await syncDataset(labeled, {
      client,
      readPhoto: countingReadPhoto,
    });

    expect(readPhotoCalls).toBe(1);
    expect(calls.updateExample).toHaveLength(1);
    expect(calls.updateExample[0]?.id).toBe("ex-b.jpg");
    expect(calls.updateExample[0]?.inputs).toEqual({});
    expect(calls.createExamples).toHaveLength(1);
    const created = calls.createExamples[0]!;
    expect(created).toHaveLength(1);
    expect(created[0]?.metadata).toEqual({ source_file: "c.jpg" });
    expect(report).toEqual({
      datasetId: "ds-1",
      created: 1,
      updated: 1,
      unchanged: 1,
    });
  });

  test("propagates the new dataset id to create payloads when dataset is missing", async () => {
    const { client, calls } = makeFakeClient({
      hasDataset: false,
      datasetId: "ds-fresh",
      existing: [],
    });
    const labeled: Solution[] = [{ file: "a.jpg", name: "Aperol", volume: 0.5 }];

    await syncDataset(labeled, {
      client,
      readPhoto: fakeReadPhoto,
    });

    expect(calls.createDataset).toHaveLength(1);
    expect(calls.createExamples).toHaveLength(1);
    expect(calls.createExamples[0]?.[0]?.dataset_id).toBe("ds-fresh");
  });
});
