/**
 * Eval harness entry point.
 *
 * 1. Loads the bottle name list and the labeled subset of solutions.
 * 2. Syncs labeled solutions to the LangSmith dataset (create / update / skip).
 * 3. Runs evaluate() with askModel as the target and the two evaluators.
 * 4. Writes predictions to assets/verbena_simple_predictions.jsonl.
 * 5. Prints a local per-row table + aggregate name_acc / volume_mae.
 */

import { resolve, basename } from "node:path";
import { evaluate } from "langsmith/evaluation";
import type { Example } from "langsmith/schemas";

import { client } from "./client";
import { loadBottleNames } from "./bottles";
import { loadSolutions, writeSolutions } from "./solutions";
import { askModel } from "./ask-model";
import {
  nameCorrect,
  volumeAbsErr,
  nameAccSummary,
  volumeMaeSummary,
} from "./evaluators";
import {
  DATASET_NAME,
  DEFAULT_MODEL,
  PATHS,
  type Prediction,
  type Solution,
} from "./types";

const REPO_ROOT = resolve(import.meta.dir, "../../..");
const SOLUTIONS_PATH = resolve(REPO_ROOT, PATHS.solutions);
const PREDICTIONS_PATH = resolve(REPO_ROOT, PATHS.predictions);

async function syncDataset(labeled: Solution[]): Promise<void> {
  let datasetId: string;
  if (await client.hasDataset({ datasetName: DATASET_NAME })) {
    const ds = await client.readDataset({ datasetName: DATASET_NAME });
    datasetId = ds.id;
  } else {
    const ds = await client.createDataset(DATASET_NAME, {
      description:
        "Verbena bar bottle photos with hand-labeled name + fill volume.",
    });
    datasetId = ds.id;
  }

  const existing = new Map<string, Example>();
  for await (const ex of client.listExamples({ datasetId })) {
    const file = (ex.inputs as { file?: string })?.file;
    if (typeof file === "string") existing.set(file, ex);
  }

  const toCreate: Array<{
    inputs: Record<string, unknown>;
    outputs: Record<string, unknown>;
    dataset_id: string;
  }> = [];
  let updated = 0;
  let unchanged = 0;

  for (const sol of labeled) {
    const ex = existing.get(sol.file);
    if (!ex) {
      toCreate.push({
        inputs: { file: sol.file },
        outputs: { name: sol.name, volume: sol.volume },
        dataset_id: datasetId,
      });
      continue;
    }
    const out = ex.outputs as { name?: string; volume?: number } | undefined;
    if (out?.name === sol.name && out?.volume === sol.volume) {
      unchanged += 1;
      continue;
    }
    await client.updateExample({
      id: ex.id,
      inputs: { file: sol.file },
      outputs: { name: sol.name, volume: sol.volume },
    });
    updated += 1;
  }

  if (toCreate.length > 0) {
    await client.createExamples(toCreate);
  }

  console.log(
    `dataset sync: +${toCreate.length} created, ~${updated} updated, =${unchanged} unchanged`,
  );
}

async function main(): Promise<void> {
  const bottleNames = await loadBottleNames();
  console.log(`loaded ${bottleNames.length} unique bottle names`);
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

  await syncDataset(labeled);

  const result = await evaluate(
    async (input: { file: string }): Promise<Prediction> =>
      askModel({ file: input.file, bottleNames }),
    {
      data: DATASET_NAME,
      evaluators: [nameCorrect, volumeAbsErr],
      summaryEvaluators: [nameAccSummary, volumeMaeSummary],
      experimentPrefix: `${DEFAULT_MODEL}-`,
      description:
        "Verbena bar bottle photos: Claude Agent SDK vision → name + fill volume.",
      maxConcurrency: 1,
    },
  );

  // Iterate the experiment results to drain the runner and collect predictions.
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
    const file = (row.example.inputs as { file?: string })?.file ?? "";
    const ref = row.example.outputs as
      | { name?: string; volume?: number }
      | undefined;
    const out = (row.run.outputs ?? {}) as Partial<Prediction>;
    const traceId = row.run.trace_id ?? row.run.id;

    const prediction: Prediction = {
      file: out.file ?? file,
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
  console.log(`wrote ${predictions.length} predictions → ${PREDICTIONS_PATH}`);

  // Local summary
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
