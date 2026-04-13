/**
 * Idempotent upsert for the verbena-simple LangSmith dataset.
 *
 * Filename → photo bytes is a stable mapping, so attachments are uploaded
 * once on create and never re-pushed on a label-only update. To replace a
 * photo's bytes, delete the example in the LangSmith UI and re-run upload.
 */

import { resolve } from "node:path";
import type {
  AttachmentInfo,
  Example,
  ExampleCreate,
  ExampleUpdate,
} from "langsmith/schemas";

import { client as defaultClient } from "./client";
import { DATASET_NAME, PATHS, REPO_ROOT, type Solution } from "./types";

export const ATTACHMENT_KEY = "bottle_photo";
const PHOTO_MIME = "image/jpeg";
const DATASET_DESCRIPTION =
  "Verbena bar bottle photos with hand-labeled name + fill volume.";

const PHOTOS_DIR = resolve(REPO_ROOT, PATHS.photosDir);

export type SyncReport = {
  datasetId: string;
  created: number;
  updated: number;
  unchanged: number;
};

export function formatSyncReport(report: SyncReport): string {
  return `${DATASET_NAME}: +${report.created} created, ~${report.updated} updated, =${report.unchanged} unchanged (dataset_id=${report.datasetId})`;
}

export type ReadPhoto = (file: string) => Promise<Uint8Array>;

/** Default photo loader — reads JPEG bytes from assets/photos/<file>. */
export const readPhotoFromAssets: ReadPhoto = async (file: string) => {
  const buf = await Bun.file(resolve(PHOTOS_DIR, file)).arrayBuffer();
  return new Uint8Array(buf);
};

/**
 * Pulls the bytes of an attachment off a LangSmith eval target's config map.
 * Returns a tagged result so the eval target can fold the failure into a
 * Prediction row instead of throwing the whole experiment.
 */
export async function fetchAttachmentBytes(
  attachments: Record<string, AttachmentInfo> | undefined,
  key: string,
): Promise<
  { ok: true; bytes: Uint8Array } | { ok: false; error: string }
> {
  const info = attachments?.[key];
  if (!info?.presigned_url) {
    return { ok: false, error: `missing ${key} attachment` };
  }
  const res = await fetch(info.presigned_url);
  if (!res.ok) {
    return {
      ok: false,
      error: `failed to fetch ${key}: ${res.status} ${res.statusText}`,
    };
  }
  return { ok: true, bytes: new Uint8Array(await res.arrayBuffer()) };
}

/**
 * Minimal subset of the LangSmith Client that syncDataset depends on. Spelled
 * out as a plain interface (instead of Pick<Client, …>) so the test fake can
 * implement it without `as unknown as` casts to dodge unused overloads.
 */
export interface SyncClient {
  hasDataset(args: { datasetName: string }): Promise<boolean>;
  readDataset(args: { datasetName: string }): Promise<{ id: string }>;
  createDataset(
    name: string,
    opts?: { description?: string },
  ): Promise<{ id: string }>;
  listExamples(args: {
    datasetId: string;
    includeAttachments?: boolean;
  }): AsyncIterable<Example>;
  createExamples(uploads: ExampleCreate[]): Promise<Example[]>;
  updateExample(update: ExampleUpdate): Promise<object>;
}

export type SyncDeps = {
  client?: SyncClient;
  readPhoto?: ReadPhoto;
};

function sameBottleNames(
  actual: unknown,
  expected: readonly string[],
): boolean {
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    return false;
  }
  return actual.every((value, index) => value === expected[index]);
}

export async function syncDataset(
  labeled: Solution[],
  bottleNames: string[],
  deps: SyncDeps = {},
): Promise<SyncReport> {
  const ls = deps.client ?? defaultClient;
  const readPhoto = deps.readPhoto ?? readPhotoFromAssets;

  let datasetId: string;
  if (await ls.hasDataset({ datasetName: DATASET_NAME })) {
    const ds = await ls.readDataset({ datasetName: DATASET_NAME });
    datasetId = ds.id;
  } else {
    const ds = await ls.createDataset(DATASET_NAME, {
      description: DATASET_DESCRIPTION,
    });
    datasetId = ds.id;
  }

  const existing = new Map<string, Example>();
  for await (const ex of ls.listExamples({ datasetId, includeAttachments: true })) {
    const file = (ex.inputs as { file?: string })?.file;
    if (typeof file === "string") existing.set(file, ex);
  }

  const newSols: Solution[] = [];
  const changed: Array<{
    sol: Solution;
    id: string;
    needsAttachment: boolean;
  }> = [];
  let unchanged = 0;
  for (const sol of labeled) {
    const ex = existing.get(sol.file);
    if (!ex) {
      newSols.push(sol);
      continue;
    }
    const inputs = ex.inputs as { possible_bottle_names?: unknown } | undefined;
    const out = ex.outputs as { name?: string; volume?: number } | undefined;
    const hasMatchingOutputs =
      out?.name === sol.name && out?.volume === sol.volume;
    const hasBottleNames = sameBottleNames(inputs?.possible_bottle_names, bottleNames);
    const hasAttachment = Boolean(ex.attachments?.[ATTACHMENT_KEY]?.presigned_url);
    if (hasMatchingOutputs && hasBottleNames && hasAttachment) {
      unchanged += 1;
      continue;
    }
    changed.push({
      sol,
      id: ex.id,
      needsAttachment: !hasAttachment,
    });
  }

  // Read new photos and apply updates in parallel. Existing rows only re-upload
  // the JPEG when the attachment is missing; label/input-only updates do not.
  const attachmentBackfills = changed.filter((item) => item.needsAttachment);
  const [newPhotos, backfillPhotos] = await Promise.all([
    Promise.all(newSols.map((s) => readPhoto(s.file))),
    Promise.all(
      attachmentBackfills.map((item) => readPhoto(item.sol.file)),
    ),
  ]);
  const backfillPhotoById = new Map<string, Uint8Array>();
  attachmentBackfills.forEach((item, index) => {
    backfillPhotoById.set(item.id, backfillPhotos[index]!);
  });

  await Promise.all(
    changed.map(({ sol, id, needsAttachment }) =>
      ls.updateExample({
        id,
        inputs: { file: sol.file, possible_bottle_names: bottleNames },
        outputs: { name: sol.name, volume: sol.volume },
        ...(needsAttachment
          ? {
              attachments: {
                [ATTACHMENT_KEY]: {
                  mimeType: PHOTO_MIME,
                  data: backfillPhotoById.get(id)!,
                },
              },
            }
          : {}),
      }),
    ),
  );

  const toCreate: ExampleCreate[] = newSols.map((sol, i) => ({
    inputs: { file: sol.file, possible_bottle_names: bottleNames },
    outputs: { name: sol.name, volume: sol.volume },
    attachments: {
      [ATTACHMENT_KEY]: { mimeType: PHOTO_MIME, data: newPhotos[i]! },
    },
    dataset_id: datasetId,
  }));

  if (toCreate.length > 0) {
    await ls.createExamples(toCreate);
  }

  return {
    datasetId,
    created: toCreate.length,
    updated: changed.length,
    unchanged,
  };
}
