import { describe, it, expect } from 'bun:test';
import {
  ITEM_CATEGORIES,
  SESSION_STATUSES,
  FILL_LEVEL_MIN,
  FILL_LEVEL_MAX,
} from '../enums';

describe('ITEM_CATEGORIES', () => {
  it('contains all spirit categories from the backend schema', () => {
    const spirits = ['whiskey', 'bourbon', 'rye', 'scotch', 'shochu', 'vodka', 'gin', 'rum', 'tequila', 'mezcal', 'brandy', 'cognac', 'liqueur', 'amaro', 'vermouth'] as const;
    for (const spirit of spirits) {
      expect(ITEM_CATEGORIES).toContain(spirit);
    }
    expect(spirits.length).toBe(15);
    expect(ITEM_CATEGORIES.length).toBeGreaterThanOrEqual(spirits.length);
  });

  it('contains non-spirit bar items', () => {
    expect(ITEM_CATEGORIES).toContain('bitters');
    expect(ITEM_CATEGORIES).toContain('syrup');
    expect(ITEM_CATEGORIES).toContain('mixer');
    expect(ITEM_CATEGORIES).toContain('juice');
    expect(ITEM_CATEGORIES).toContain('garnish');
  });

  it('has exactly 25 categories matching the backend enum', () => {
    expect(ITEM_CATEGORIES.length).toBe(25);
    expect(ITEM_CATEGORIES).toContain('other');
    expect(ITEM_CATEGORIES).toContain('n/a');
    // no duplicates
    const unique = new Set(ITEM_CATEGORIES);
    expect(unique.size).toBe(ITEM_CATEGORIES.length);
  });
});

describe('SESSION_STATUSES', () => {
  it('has the 4 session lifecycle states in order', () => {
    expect(SESSION_STATUSES).toEqual(['capturing', 'processing', 'reviewing', 'confirmed']);
    expect(SESSION_STATUSES.length).toBe(4);
    expect(SESSION_STATUSES[0]).toBe('capturing');
    expect(SESSION_STATUSES[3]).toBe('confirmed');
  });
});

describe('fill level constants', () => {
  it('defines the valid range as 0-10 tenths', () => {
    expect(FILL_LEVEL_MIN).toBe(0);
    expect(FILL_LEVEL_MAX).toBe(10);
    expect(FILL_LEVEL_MAX).toBeGreaterThan(FILL_LEVEL_MIN);
  });
});
