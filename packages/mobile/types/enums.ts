/**
 * Mirrors the pgEnum values from packages/backend/src/schema.ts.
 * Keep in sync with the backend — these are the source-of-truth categories
 * used across the VLM pipeline, inventory, and UI.
 */

export const ITEM_CATEGORIES = [
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
  'wine',
  'beer',
  'bitters',
  'syrup',
  'mixer',
  'juice',
  'puree',
  'garnish',
  'other',
  'n/a',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const SESSION_STATUSES = [
  'capturing',
  'processing',
  'reviewing',
  'confirmed',
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

/** Fill level in tenths: 0 = empty, 10 = full. */
export const FILL_LEVEL_MIN = 0;
export const FILL_LEVEL_MAX = 10;
