/**
 * Standalone publish step. Reads local authoring inputs, updates the LangSmith
 * dataset shape, and optionally tags the resulting dataset version.
 */

import { resolve } from "node:path";

import { client } from "./client";
import { optionalFlag } from "./cli";
import { loadSolutions } from "./solutions";
import { formatSyncReport, syncDataset } from "./sync-dataset";
import { DATASET_NAME, PATHS, REPO_ROOT } from "./types";

const SOLUTIONS_PATH = resolve(REPO_ROOT, PATHS.solutions);

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveLatestDatasetVersion(): Promise<string> {
  const startedAt = new Date();
  let lastError: unknown;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      const version = await client.readDatasetVersion({
        datasetName: DATASET_NAME,
        asOf: startedAt,
      });
      return version.as_of;
    } catch (error) {
      lastError = error;
      await sleep(1_000);
    }
  }
  throw lastError;
}

async function main(): Promise<void> {
  const args = Bun.argv.slice(2);
  const datasetTag = optionalFlag(args, "--dataset-tag", "");

  const solutions = await loadSolutions(SOLUTIONS_PATH);
  const labeled = [...solutions.values()].filter((s) => s.name.trim() !== "");
  if (labeled.length === 0) {
    console.error(
      `no labeled rows in ${SOLUTIONS_PATH}. Run \`bun run seed\` and fill in name + volume by hand, then re-run.`,
    );
    process.exit(1);
  }
  console.log(
    `${labeled.length}/${solutions.size} solutions are labeled — uploading those`,
  );

  const report = await syncDataset(labeled);
  console.log(formatSyncReport(report));

  if (!datasetTag) {
    console.log("dataset tag: skipped");
    return;
  }

  const datasetVersionAsOf = await resolveLatestDatasetVersion();
  await client.updateDatasetTag({
    datasetName: DATASET_NAME,
    asOf: datasetVersionAsOf,
    tag: datasetTag,
  });

  console.log(`dataset tag: ${datasetTag} -> ${datasetVersionAsOf}`);
}

if (import.meta.main) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
