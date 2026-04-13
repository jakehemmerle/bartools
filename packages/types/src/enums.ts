export const ITEM_CATEGORIES = [
  // spirits
  'whiskey',
  'bourbon',
  'rye',
  'scotch',
  'shochu',
  'vodka',
  'gin',
  'rum',
  'tequila',
  'mezcal',
  'brandy',
  'cognac',
  'liqueur',
  'amaro',
  'vermouth',
  // not spirits but on the same shelf
  'wine',
  'beer',
  // bar consumables
  'bitters',
  'syrup',
  'mixer',
  'juice',
  'puree',
  'garnish',
  // catch-all
  'other',
  'n/a',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const REPORT_STATUSES = [
  'created',
  'processing',
  'unreviewed',
  'reviewed',
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export const REPORT_RECORD_STATUSES = [
  'pending',
  'inferred',
  'failed',
  'reviewed',
] as const;

export type ReportRecordStatus = (typeof REPORT_RECORD_STATUSES)[number];

export const INFERENCE_JOB_STATUSES = [
  'queued',
  'running',
  'succeeded',
  'failed',
] as const;

export type InferenceJobStatus = (typeof INFERENCE_JOB_STATUSES)[number];

export const FILL_LEVEL_MIN = 0;
export const FILL_LEVEL_MAX = 10;
