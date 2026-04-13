import { resolve } from "node:path";
import { evaluate } from "langsmith/evaluation";

import { DEFAULT_MODEL } from "@bartools/inference";
import { client } from "./client";
import { loadSolutions, writeSolutions } from "./solutions";
import { askModel } from "./ask-model";
import {
  nameCorrect,
  volumeAbsErr,
  nameAccSummary,
  volumeMaeSummary,
} from "./evaluators";
import { syncDataset } from "./sync-dataset";
import { DATASET_NAME, PATHS, REPO_ROOT, type Prediction } from "./types";

const SOLUTIONS_PATH = resolve(REPO_ROOT, PATHS.solutions);
const PREDICTIONS_PATH = resolve(REPO_ROOT, PATHS.predictions);

function readSourceFile(row: { metadata?: Record<string, unknown> }): string {
  return typeof row.metadata?.source_file === "string" ? row.metadata.source_file : "";
}

async function main(): Promise<void> {
  console.log(`using model: ${DEFAULT_MODEL}`);

  const solutions = await loadSolutions(SOLUTIONS_PATH);
  const labeled = [...solutions.values()].filter((s) => s.name.trim() !== "");
  if (labeled.length === 0) {
    console.error(
      `no labeled rows in ${SOLUTIONS_PATH}. Run \`bun run seed\` and fill in name + volume by hand, then re-run.`,
    );
    process.exit(1);
  }
  console.log(
    `${labeled.length}/${solutions.size} solutions are labeled — running eval on those`,
  );

  const syncReport = await syncDataset(labeled);
  console.log(
    `${DATASET_NAME}: +${syncReport.created} created, ~${syncReport.updated} updated, =${syncReport.unchanged} unchanged (dataset_id=${syncReport.datasetId})`,
  );

  const result = await evaluate(
    async (
      _input: Record<string, never>,
      config?: { attachments?: Record<string, unknown> },
    ): Promise<Prediction> =>
      askModel({
        file: "",
        attachments: config?.attachments as Parameters<typeof askModel>[0]["attachments"],
      }),
    {
      data: DATASET_NAME,
      evaluators: [nameCorrect, volumeAbsErr],
      summaryEvaluators: [nameAccSummary, volumeMaeSummary],
      experimentPrefix: `${DEFAULT_MODEL}-`,
      description:
        "Verbena bar bottle photos: Claude Agent SDK vision -> name + fill volume.",
      maxConcurrency: 1,
      includeAttachments: true,
    },
  );

  const predictions: Prediction[] = [];
  type Row = {
    file: string;
    expectedName: string;
    gotName: string;
    expectedVol: number;
    gotVol: number;
    error?: string;
  };
  const rows: Row[] = [];

  for await (const row of result) {
    const file = readSourceFile(row.example);
    const ref = row.example.outputs as
      | { name?: string; volume?: number }
      | undefined;
    const out = (row.run.outputs ?? {}) as Partial<Prediction>;
    const traceId = row.run.trace_id ?? row.run.id;

    const prediction: Prediction = {
      file: out.file || file,
      name: out.name ?? "",
      volume: out.volume ?? 0,
      ...(traceId ? { trace_id: traceId } : {}),
      ...(out.error ? { error: out.error } : {}),
    };
    predictions.push(prediction);
    rows.push({
      file,
      expectedName: ref?.name ?? "",
      gotName: prediction.name,
      expectedVol: ref?.volume ?? 0,
      gotVol: prediction.volume,
      error: prediction.error,
    });
  }

  await writeSolutions(PREDICTIONS_PATH, predictions);
  console.log(`wrote ${predictions.length} predictions -> ${PREDICTIONS_PATH}`);

  console.log("");
  console.log(
    "file                 | expected name              | got name                   | match | exp vol | got vol | abs err",
  );
  console.log(
    "---------------------|----------------------------|----------------------------|-------|---------|---------|--------",
  );
  let nameHits = 0;
  let absErrSum = 0;
  for (const r of rows) {
    const match = r.expectedName === r.gotName;
    const absErr = Math.abs(r.gotVol - r.expectedVol);
    if (match) nameHits += 1;
    absErrSum += absErr;
    console.log(
      [
        r.file.padEnd(20),
        (r.expectedName || "(empty)").slice(0, 26).padEnd(26),
        (r.gotName || "(empty)").slice(0, 26).padEnd(26),
        match ? "  ✓  " : "  ✗  ",
        r.expectedVol.toFixed(1).padStart(7),
        r.gotVol.toFixed(1).padStart(7),
        absErr.toFixed(2).padStart(7),
      ].join(" | ") + (r.error ? `  err: ${r.error}` : ""),
    );
  }
  const nameAcc = rows.length > 0 ? nameHits / rows.length : 0;
  const volMae = rows.length > 0 ? absErrSum / rows.length : 0;
  console.log("");
  console.log(
    `name_acc=${(nameAcc * 100).toFixed(1)}%  volume_mae=${volMae.toFixed(3)}  (n=${rows.length})`,
  );

  await client.awaitPendingTraceBatches();
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
