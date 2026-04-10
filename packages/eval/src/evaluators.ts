import type { EvaluationResult } from "langsmith/evaluation";

type EvalArgs = {
  outputs: Record<string, unknown>;
  referenceOutputs?: Record<string, unknown>;
};

export const nameCorrect = async ({
  outputs,
  referenceOutputs,
}: EvalArgs): Promise<EvaluationResult> => {
  const got = (outputs.name as string) ?? "";
  const expected = (referenceOutputs?.name as string) ?? "";
  return {
    key: "name_correct",
    score: got === expected ? 1 : 0,
    comment: `expected="${expected}" got="${got}"`,
  };
};

export const volumeAbsErr = async ({
  outputs,
  referenceOutputs,
}: EvalArgs): Promise<EvaluationResult> => {
  const got = (outputs.volume as number) ?? 0;
  const expected = (referenceOutputs?.volume as number) ?? 0;
  return {
    key: "volume_abs_err",
    score: Math.abs(got - expected),
  };
};

// --- Summary evaluators (aggregate, run once per experiment) ---

type SummaryArgs = {
  outputs: Array<Record<string, unknown>>;
  referenceOutputs?: Array<Record<string, unknown>>;
};

export const nameAccSummary = async ({
  outputs,
  referenceOutputs,
}: SummaryArgs): Promise<EvaluationResult> => {
  const refs = referenceOutputs ?? [];
  const n = outputs.length;
  let hits = 0;
  for (let i = 0; i < n; i++) {
    if ((outputs[i]?.name as string) === (refs[i]?.name as string)) hits += 1;
  }
  return { key: "name_acc", score: n > 0 ? hits / n : 0 };
};

export const volumeMaeSummary = async ({
  outputs,
  referenceOutputs,
}: SummaryArgs): Promise<EvaluationResult> => {
  const refs = referenceOutputs ?? [];
  const n = outputs.length;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const got = (outputs[i]?.volume as number) ?? 0;
    const exp = (refs[i]?.volume as number) ?? 0;
    sum += Math.abs(got - exp);
  }
  return { key: "volume_mae", score: n > 0 ? sum / n : 0 };
};
