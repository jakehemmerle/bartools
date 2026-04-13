import { describe, it, expect } from 'bun:test';
import {
  ITEM_CATEGORIES,
  REPORT_STATUSES,
  REPORT_RECORD_STATUSES,
  INFERENCE_JOB_STATUSES,
  FILL_LEVEL_MIN,
  FILL_LEVEL_MAX,
} from '../enums';

describe('ITEM_CATEGORIES', () => {
  it('contains all spirit categories', () => {
    const spirits = [
      'whiskey', 'bourbon', 'rye', 'scotch', 'shochu',
      'vodka', 'gin', 'rum', 'tequila', 'mezcal',
      'brandy', 'cognac', 'liqueur', 'amaro', 'vermouth',
    ] as const;
    for (const spirit of spirits) {
      expect(ITEM_CATEGORIES).toContain(spirit);
    }
  });

  it('contains non-spirit bar items', () => {
    const barItems = ['wine', 'beer', 'bitters', 'syrup', 'mixer', 'juice', 'puree', 'garnish'] as const;
    for (const item of barItems) {
      expect(ITEM_CATEGORIES).toContain(item);
    }
  });

  it('has exactly 25 categories with no duplicates', () => {
    expect(ITEM_CATEGORIES.length).toBe(25);
    expect(new Set(ITEM_CATEGORIES).size).toBe(25);
    expect(ITEM_CATEGORIES).toContain('other');
    expect(ITEM_CATEGORIES).toContain('n/a');
  });
});

describe('REPORT_STATUSES', () => {
  it('has the 4 report lifecycle states in order', () => {
    expect(REPORT_STATUSES).toEqual(['created', 'processing', 'unreviewed', 'reviewed']);
  });
});

describe('REPORT_RECORD_STATUSES', () => {
  it('has the 4 record states in order', () => {
    expect(REPORT_RECORD_STATUSES).toEqual(['pending', 'inferred', 'failed', 'reviewed']);
  });
});

describe('INFERENCE_JOB_STATUSES', () => {
  it('has the 4 job states in order', () => {
    expect(INFERENCE_JOB_STATUSES).toEqual(['queued', 'running', 'succeeded', 'failed']);
  });
});

describe('fill level constants', () => {
  it('defines the valid range as 0-10 tenths', () => {
    expect(FILL_LEVEL_MIN).toBe(0);
    expect(FILL_LEVEL_MAX).toBe(10);
    expect(FILL_LEVEL_MAX).toBeGreaterThan(FILL_LEVEL_MIN);
  });
});
