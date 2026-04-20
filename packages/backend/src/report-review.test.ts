import { describe, test, expect, mock } from 'bun:test';
import { and, eq } from 'drizzle-orm';

// Neutralize storage side effects during review tests.
mock.module('./storage', () => ({
  getBucketName: () => 'test-bucket',
  getTtlSeconds: () => 300,
  presignPut: async () => ({ putUrl: '', expiresAt: new Date() }),
  presignGet: async () => ({ getUrl: '', expiresAt: new Date() }),
  getObjectBytes: async () => new Uint8Array(),
}));

import { db } from './db';
import { reviewReport } from './report-review';
import {
  bottles,
  inventory,
  locations,
  reportRecords,
  reports,
  scans,
  users,
  venueMembers,
  venues,
} from './schema';

type Fixture = {
  userId: string;
  venueId: string;
  locationId: string | null;
  reportId: string;
  recordIds: string[];
  scanIds: string[];
  bottleIds: string[]; // original (inferred) bottle ids
};

async function seedFixture(opts: {
  locationIncluded: boolean;
  photos: number;
}): Promise<Fixture> {
  const [user] = await db
    .insert(users)
    .values({ email: `rev-${crypto.randomUUID()}@bartools.test` })
    .returning();
  const [venue] = await db
    .insert(venues)
    .values({ name: `Review Venue ${crypto.randomUUID().slice(0, 6)}` })
    .returning();
  await db.insert(venueMembers).values({ venueId: venue.id, userId: user.id });

  let locationId: string | null = null;
  if (opts.locationIncluded) {
    const [loc] = await db
      .insert(locations)
      .values({ venueId: venue.id, name: `Main ${crypto.randomUUID().slice(0, 6)}` })
      .returning();
    locationId = loc.id;
  }

  const bottleRows = await db
    .insert(bottles)
    .values(
      Array.from({ length: opts.photos }, (_, idx) => ({
        name: `Inferred Bottle ${idx}-${crypto.randomUUID().slice(0, 6)}`,
        category: 'whiskey' as const,
        sizeMl: 750,
      }))
    )
    .returning();

  const [report] = await db
    .insert(reports)
    .values({
      userId: user.id,
      venueId: venue.id,
      locationId,
      status: 'unreviewed',
      photoCount: opts.photos,
      processedCount: opts.photos,
    })
    .returning();

  const scanRows = await db
    .insert(scans)
    .values(
      Array.from({ length: opts.photos }, (_, idx) => ({
        reportId: report.id,
        userId: user.id,
        venueId: venue.id,
        locationId,
        photoGcsBucket: 'test-bucket',
        photoGcsObject: `reports/${report.id}/photo-${idx}-${crypto.randomUUID()}.jpg`,
        sortOrder: idx,
      }))
    )
    .returning();

  const recordRows = await db
    .insert(reportRecords)
    .values(
      scanRows.map((scan, idx) => ({
        reportId: report.id,
        scanId: scan.id,
        status: 'inferred' as const,
        originalBottleId: bottleRows[idx].id,
        originalBottleName: bottleRows[idx].name,
        originalCategory: bottleRows[idx].category,
        originalVolumeMl: bottleRows[idx].sizeMl,
        originalFillTenths: 5,
      }))
    )
    .returning();

  return {
    userId: user.id,
    venueId: venue.id,
    locationId,
    reportId: report.id,
    recordIds: recordRows.map((r) => r.id),
    scanIds: scanRows.map((s) => s.id),
    bottleIds: bottleRows.map((b) => b.id),
  };
}

describe('reviewReport → inventory upsert', () => {
  test('upserts an inventory row for each reviewed record with correctedBottleId', async () => {
    const fx = await seedFixture({ locationIncluded: true, photos: 2 });

    await reviewReport(fx.reportId, {
      userId: fx.userId,
      records: fx.recordIds.map((id, idx) => ({
        id,
        bottleId: fx.bottleIds[idx],
        fillTenths: idx === 0 ? 7 : 3,
      })),
    });

    const rows = await db
      .select()
      .from(inventory)
      .where(eq(inventory.locationId, fx.locationId!));

    expect(rows).toHaveLength(2);

    for (const [idx, bottleId] of fx.bottleIds.entries()) {
      const matching = rows.find((r) => r.bottleId === bottleId);
      expect(matching).toBeDefined();
      expect(matching!.fillLevelTenths).toBe(idx === 0 ? 7 : 3);
      expect(matching!.lastScanId).toBe(fx.scanIds[idx]);
      expect(matching!.lastScannedAt).toBeInstanceOf(Date);
    }
  });

  test('creates a catalog bottle from manual review details for unrecognized records', async () => {
    const fx = await seedFixture({ locationIncluded: true, photos: 1 });

    await reviewReport(fx.reportId, {
      userId: fx.userId,
      records: [
        {
          id: fx.recordIds[0],
          bottle: {
            name: 'Unlisted Mezcal',
            category: 'mezcal',
            sizeMl: 750,
          },
          fillTenths: 6,
        },
      ],
    });

    const [createdBottle] = await db
      .select()
      .from(bottles)
      .where(eq(bottles.name, 'Unlisted Mezcal'));
    expect(createdBottle).toBeDefined();
    expect(createdBottle.category).toBe('mezcal');

    const [record] = await db
      .select()
      .from(reportRecords)
      .where(eq(reportRecords.id, fx.recordIds[0]));
    expect(record.correctedBottleId).toBe(createdBottle.id);
    expect(record.correctedBottleName).toBe('Unlisted Mezcal');
    expect(record.correctedFillTenths).toBe(6);

    const inventoryRows = await db
      .select()
      .from(inventory)
      .where(eq(inventory.bottleId, createdBottle.id));
    expect(inventoryRows).toHaveLength(1);
    expect(inventoryRows[0].fillLevelTenths).toBe(6);
  });

  test('re-reviewing updates the existing inventory row (no duplicates)', async () => {
    const fx = await seedFixture({ locationIncluded: true, photos: 1 });

    await reviewReport(fx.reportId, {
      userId: fx.userId,
      records: [
        { id: fx.recordIds[0], bottleId: fx.bottleIds[0], fillTenths: 4 },
      ],
    });

    // Flip the report + record back to unreviewed so we can call reviewReport
    // again. In practice re-review happens because a separate downstream
    // action (not yet implemented) reopens the report; we simulate it here.
    await db
      .update(reports)
      .set({ status: 'unreviewed', reviewedAt: null })
      .where(eq(reports.id, fx.reportId));
    await db
      .update(reportRecords)
      .set({ status: 'inferred' })
      .where(eq(reportRecords.id, fx.recordIds[0]));

    await reviewReport(fx.reportId, {
      userId: fx.userId,
      records: [
        { id: fx.recordIds[0], bottleId: fx.bottleIds[0], fillTenths: 9 },
      ],
    });

    const rows = await db
      .select()
      .from(inventory)
      .where(
        and(
          eq(inventory.locationId, fx.locationId!),
          eq(inventory.bottleId, fx.bottleIds[0])
        )
      );
    expect(rows).toHaveLength(1);
    expect(rows[0].fillLevelTenths).toBe(9);
    expect(rows[0].lastScanId).toBe(fx.scanIds[0]);
  });

  test('reports without a locationId skip the inventory upsert', async () => {
    const fx = await seedFixture({ locationIncluded: false, photos: 1 });

    await reviewReport(fx.reportId, {
      userId: fx.userId,
      records: [
        { id: fx.recordIds[0], bottleId: fx.bottleIds[0], fillTenths: 6 },
      ],
    });

    const rows = await db.select().from(inventory);
    expect(rows).toHaveLength(0);
  });
});
