import { describe, it, expect } from 'bun:test';
import {
  toIso,
  maybeModelOutput,
  maybeCorrectedValues,
  wasCorrected,
} from './report-record-helpers';

describe('toIso', () => {
  it('converts a Date to ISO string', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    expect(toIso(date)).toBe('2026-01-01T00:00:00.000Z');
  });

  it('returns undefined for null', () => {
    expect(toIso(null)).toBeUndefined();
  });

  it('returns undefined for undefined', () => {
    expect(toIso(undefined)).toBeUndefined();
  });
});

const NULL_RECORD = {
  originalBottleName: null,
  originalCategory: null,
  originalUpc: null,
  originalVolumeMl: null,
  originalFillTenths: null,
};

const POPULATED_RECORD = {
  originalBottleName: 'Maker\'s Mark',
  originalCategory: 'bourbon',
  originalUpc: '085246139431',
  originalVolumeMl: 750,
  originalFillTenths: 7,
};

describe('maybeModelOutput', () => {
  it('returns undefined when all fields are null', () => {
    expect(maybeModelOutput(NULL_RECORD)).toBeUndefined();
  });

  it('returns model output with fillPercent = fillTenths * 10', () => {
    const result = maybeModelOutput(POPULATED_RECORD);
    expect(result).toEqual({
      bottleName: 'Maker\'s Mark',
      category: 'bourbon',
      upc: '085246139431',
      volumeMl: 750,
      fillPercent: 70,
    });
  });

  it('returns partial output when some fields are null', () => {
    const result = maybeModelOutput({
      ...NULL_RECORD,
      originalBottleName: 'Hakushu 12Y',
      originalFillTenths: 5,
    });
    expect(result).toEqual({
      bottleName: 'Hakushu 12Y',
      category: undefined,
      upc: undefined,
      volumeMl: undefined,
      fillPercent: 50,
    });
  });
});

const NULL_CORRECTED = {
  correctedBottleName: null,
  correctedCategory: null,
  correctedUpc: null,
  correctedVolumeMl: null,
  correctedFillTenths: null,
};

const POPULATED_CORRECTED = {
  correctedBottleName: 'Buffalo Trace',
  correctedCategory: 'bourbon',
  correctedUpc: '080244001988',
  correctedVolumeMl: 750,
  correctedFillTenths: 4,
};

describe('maybeCorrectedValues', () => {
  it('returns undefined when all fields are null', () => {
    expect(maybeCorrectedValues(NULL_CORRECTED)).toBeUndefined();
  });

  it('returns corrected values with fillPercent = fillTenths * 10', () => {
    const result = maybeCorrectedValues(POPULATED_CORRECTED);
    expect(result).toEqual({
      bottleName: 'Buffalo Trace',
      category: 'bourbon',
      upc: '080244001988',
      volumeMl: 750,
      fillPercent: 40,
    });
  });
});

describe('wasCorrected', () => {
  const base = {
    originalBottleId: 'bottle-1',
    correctedBottleId: null,
    originalBottleName: 'Maker\'s Mark',
    correctedBottleName: null,
    originalCategory: 'bourbon',
    correctedCategory: null,
    originalUpc: null,
    correctedUpc: null,
    originalVolumeMl: 750,
    correctedVolumeMl: null,
    originalFillTenths: 7,
    correctedFillTenths: null,
  };

  it('returns false when both correctedBottleId and correctedFillTenths are null', () => {
    expect(wasCorrected(base)).toBe(false);
  });

  it('returns false when corrected values match originals', () => {
    expect(wasCorrected({
      ...base,
      correctedBottleId: 'bottle-1',
      correctedBottleName: 'Maker\'s Mark',
      correctedCategory: 'bourbon',
      correctedVolumeMl: 750,
      correctedFillTenths: 7,
    })).toBe(false);
  });

  it('returns true when bottle changed', () => {
    expect(wasCorrected({
      ...base,
      correctedBottleId: 'bottle-2',
      correctedFillTenths: 7,
    })).toBe(true);
  });

  it('returns true when fill level changed', () => {
    expect(wasCorrected({
      ...base,
      correctedBottleId: 'bottle-1',
      correctedFillTenths: 5,
    })).toBe(true);
  });
});
