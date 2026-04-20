import path from "node:path";
import { DEFAULT_MODEL, MAX_ATTEMPTS, VOLUME_ENUM, type Volume } from "@bartools/inference";

/**
 * Shared contract for the bottle-ID eval harness.
 *
 * Every other file in @bartools/eval imports from here. Constants are frozen
 * here so the parallel implementation tracks (data plumbing, agent harness,
 * eval pipeline) all agree on the same shape.
 */

export type Solution = {
  file: string;
  name: string;
  volume: number;
};

export type Prediction = {
  file: string;
  name: string;
  volume: number;
  /** LangSmith root run id — lets you drill into the trace from predictions.jsonl. */
  trace_id?: string;
  error?: string;
};

export const DATASET_NAME = "verbena-simple";
export { DEFAULT_MODEL, MAX_ATTEMPTS, VOLUME_ENUM, type Volume };

/** Path constants relative to the repo root. */
export const PATHS = {
  csv: "packages/inference/assets/verbena_simple.csv",
  photosDir: "assets/photos",
  solutions: "assets/verbena_simple_solutions.jsonl",
  predictions: "assets/verbena_simple_predictions.jsonl",
} as const;

export const REPO_ROOT = path.resolve(import.meta.dir, "../../..");
