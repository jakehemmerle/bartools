import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { eq } from 'drizzle-orm';

// Other test files (report-review, report-lifecycle, inventory-queries)
// install mock.module('./storage', …) with empty stubs — and bun caches
// module mocks process-wide, so those stubs leak into this file if we do
// nothing. We overwrite here with a stub that returns a real-looking
// https URL so getReportDetail's assertion that imageUrl is an https URL
// holds regardless of run order.
mock.module('./storage', () => ({
  getBucketName: () => 'test-bucket',
  getTtlSeconds: () => 300,
  presignPut: async () => ({ putUrl: '', expiresAt: new Date() }),
  presignGet: async (object: string) => ({
    getUrl: `https://signed.test/${object}?sig=stub`,
    expiresAt: new Date(Date.now() + 300_000),
  }),
  getObjectBytes: async () => new Uint8Array(),
}));

import { db } from './db';
import { bottles, reportRecords } from './schema';
import { getReportDetail, getReportStreamState } from './report-queries';
import { buildTestGcsObject, seedTestScenario, type TestIds } from './test-fixtures';

async function seedBottle(opts: {
  name: string;
  category: 'whiskey' | 'tequila' | 'vodka' | 'gin' | 'rum' | 'wine' | 'beer' | 'other';
  sizeMl?: number;
  upc?: string;
}): Promise<string> {
  const [b] = await db
    .insert(bottles)
    .values({
      name: opts.name,
      category: opts.category,
      sizeMl: opts.sizeMl ?? 750,
      upc: opts.upc,
    })
    .returning();
  return b.id;
}

describe('getReportDetail', () => {
  let ids: TestIds;

  beforeEach(async () => {
    const reportId = crypto.randomUUID();
    const { bucket, object } = buildTestGcsObject(reportId, 'photo.jpg');
    ids = await seedTestScenario({ bucket, object });
  });

  test('inferred record emits https imageUrl and bottleId from originalBottleId', async () => {
    const bottleId = await seedBottle({ name: 'Hakushu 12Y', category: 'whiskey' });

    await db
      .update(reportRecords)
      .set({
        status: 'inferred',
        originalBottleId: bottleId,
        originalBottleName: 'Hakushu 12Y',
        originalCategory: 'whiskey',
        originalVolumeMl: 750,
        originalFillTenths: 7,
      })
      .where(eq(reportRecords.id, ids.recordId));

    const detail = await getReportDetail(ids.reportId);
    expect(detail).not.toBeNull();
    expect(detail!.bottleRecords).toHaveLength(1);

    const [record] = detail!.bottleRecords;
    expect(record.imageUrl).toMatch(/^https:\/\//);
    expect(record.imageUrl).not.toMatch(/^gs:\/\//);
    expect(record.bottleId).toBe(bottleId);
    expect(record.bottleName).toBe('Hakushu 12Y');
    expect(record.fillPercent).toBe(70);
  });

  test('corrected record emits corrected bottleId (not original)', async () => {
    const originalBottleId = await seedBottle({ name: 'Wrong Guess', category: 'vodka' });
    const correctedBottleId = await seedBottle({ name: 'Right Answer', category: 'whiskey' });

    await db
      .update(reportRecords)
      .set({
        status: 'reviewed',
        originalBottleId,
        originalBottleName: 'Wrong Guess',
        originalCategory: 'vodka',
        originalFillTenths: 5,
        correctedBottleId,
        correctedBottleName: 'Right Answer',
        correctedCategory: 'whiskey',
        correctedFillTenths: 8,
      })
      .where(eq(reportRecords.id, ids.recordId));

    const detail = await getReportDetail(ids.reportId);
    const [record] = detail!.bottleRecords;
    expect(record.bottleId).toBe(correctedBottleId);
    expect(record.bottleId).not.toBe(originalBottleId);
    expect(record.imageUrl).toMatch(/^https:\/\//);
    expect(record.corrected).toBe(true);
  });

  test('failed record with both bottle ids null returns undefined bottleId but populated fields', async () => {
    await db
      .update(reportRecords)
      .set({
        status: 'failed',
        errorCode: 'catalog_miss',
        errorMessage: 'No bottle matched',
      })
      .where(eq(reportRecords.id, ids.recordId));

    const detail = await getReportDetail(ids.reportId);
    const [record] = detail!.bottleRecords;
    expect(record.bottleId).toBeUndefined();
    expect(record.status).toBe('failed');
    expect(record.errorCode).toBe('catalog_miss');
    expect(record.errorMessage).toBe('No bottle matched');
    // imageUrl must still be a valid https URL since the scan/photo exists.
    expect(record.imageUrl).toMatch(/^https:\/\//);
  });
});

describe('getReportStreamState', () => {
  test('inherits signed imageUrl and bottleId from getReportDetail', async () => {
    const reportId = crypto.randomUUID();
    const { bucket, object } = buildTestGcsObject(reportId, 'photo.jpg');
    const ids = await seedTestScenario({ bucket, object });
    const bottleId = await seedBottle({ name: 'Test Bottle', category: 'whiskey' });

    await db
      .update(reportRecords)
      .set({
        status: 'inferred',
        originalBottleId: bottleId,
        originalBottleName: 'Test Bottle',
        originalCategory: 'whiskey',
        originalFillTenths: 6,
      })
      .where(eq(reportRecords.id, ids.recordId));

    const state = await getReportStreamState(ids.reportId);
    expect(state).not.toBeNull();
    expect(state!.records).toHaveLength(1);
    const [record] = state!.records;
    expect(record.imageUrl).toMatch(/^https:\/\//);
    expect(record.bottleId).toBe(bottleId);
  });
});
