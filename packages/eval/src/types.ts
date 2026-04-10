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

export const VOLUME_ENUM = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] as const;
export type Volume = (typeof VOLUME_ENUM)[number];

export const DEFAULT_MODEL = "claude-sonnet-4-6";
export const DATASET_NAME = "verbena-simple";
export const MAX_ATTEMPTS = 4;

/** Path constants relative to the repo root. */
export const PATHS = {
  csv: "assets/verbena_simple.csv",
  photosDir: "assets/photos",
  solutions: "assets/verbena_simple_solutions.jsonl",
  predictions: "assets/verbena_simple_predictions.jsonl",
} as const;
