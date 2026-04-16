export const VOLUME_ENUM = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0] as const;
export type Volume = (typeof VOLUME_ENUM)[number];

export const DEFAULT_MODEL = process.env.BARTOOLS_MODEL ?? "claude-sonnet-4-6";
export const MAX_ATTEMPTS = 4;
