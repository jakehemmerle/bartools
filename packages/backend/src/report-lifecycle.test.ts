import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { eq } from 'drizzle-orm';

// addReportPhotos calls getBucketName() which reads process.env.GCS_BUCKET.
// Stub it before importing so the test doesn't need live GCS config.
mock.module('./storage', () => ({
  getBucketName: () => 'test-bucket',
  getTtlSeconds: () => 300,
  presignPut: async () => ({ putUrl: '', expiresAt: new Date() }),
  getObjectBytes: async () => new Uint8Array(),
}));

import { db } from './db';
import { addReportPhotos } from './report-service';
import { locations, reports, scans, users, venueMembers, venues } from './schema';

type Fixture = {
  userId: string;
  venueId: string;
  locationId: string;
  reportId: string;
};

async function seedEmptyReport(): Promise<Fixture> {
  const [user] = await db
    .insert(users)
    .values({ email: `idem-${crypto.randomUUID()}@bartools.test` })
    .returning();
  const [venue] = await db.insert(venues).values({ name: 'Idem Venue' }).returning();
  await db.insert(venueMembers).values({ venueId: venue.id, userId: user.id });
  const [location] = await db
    .insert(locations)
    .values({ venueId: venue.id, name: 'Idem Bar' })
    .returning();
  const [report] = await db
    .insert(reports)
    .values({ userId: user.id, venueId: venue.id, locationId: location.id })
    .returning();
  return {
    userId: user.id,
    venueId: venue.id,
    locationId: location.id,
    reportId: report.id,
  };
}

async function teardown(fx: Fixture) {
  await db.delete(scans).where(eq(scans.reportId, fx.reportId));
  await db.delete(reports).where(eq(reports.id, fx.reportId));
  await db.delete(locations).where(eq(locations.venueId, fx.venueId));
  await db.delete(venueMembers).where(eq(venueMembers.userId, fx.userId));
  await db.delete(venues).where(eq(venues.id, fx.venueId));
  await db.delete(users).where(eq(users.id, fx.userId));
}

describe('addReportPhotos idempotency', () => {
  let fx: Fixture;

  beforeEach(async () => {
    fx = await seedEmptyReport();
  });

  test('replaying the same objects does not duplicate scans rows', async () => {
    const objA = `reports/${fx.reportId}/${crypto.randomUUID()}.jpg`;
    const objB = `reports/${fx.reportId}/${crypto.randomUUID()}.jpg`;

    const first = await addReportPhotos(fx.reportId, [
      { object: objA, sortOrder: 0 },
      { object: objB, sortOrder: 1 },
    ]);
    expect(first).toHaveLength(2);
    expect(first.map((s) => s.photoGcsObject).sort()).toEqual([objA, objB].sort());

    // Replay: same payload. Should return the same rows (same ids), not create new ones.
    const replay = await addReportPhotos(fx.reportId, [
      { object: objA, sortOrder: 0 },
      { object: objB, sortOrder: 1 },
    ]);
    expect(replay.map((s) => s.id).sort()).toEqual(first.map((s) => s.id).sort());

    const rows = await db.select().from(scans).where(eq(scans.reportId, fx.reportId));
    expect(rows).toHaveLength(2);

    const [{ photoCount }] = await db
      .select({ photoCount: reports.photoCount })
      .from(reports)
      .where(eq(reports.id, fx.reportId));
    expect(photoCount).toBe(2);

    await teardown(fx);
  });

  test('mixed replay: previously-seen objects reuse rows, new ones insert', async () => {
    const objA = `reports/${fx.reportId}/${crypto.randomUUID()}.jpg`;
    const objB = `reports/${fx.reportId}/${crypto.randomUUID()}.jpg`;
    const objC = `reports/${fx.reportId}/${crypto.randomUUID()}.jpg`;

    const first = await addReportPhotos(fx.reportId, [
      { object: objA, sortOrder: 0 },
      { object: objB, sortOrder: 1 },
    ]);
    const firstIds = new Map(first.map((s) => [s.photoGcsObject, s.id]));

    const second = await addReportPhotos(fx.reportId, [
      { object: objA, sortOrder: 0 },
      { object: objB, sortOrder: 1 },
      { object: objC, sortOrder: 2 },
    ]);
    expect(second).toHaveLength(3);
    expect(second[0]!.id).toBe(firstIds.get(objA)!);
    expect(second[1]!.id).toBe(firstIds.get(objB)!);
    expect(second[2]!.photoGcsObject).toBe(objC);

    const rows = await db.select().from(scans).where(eq(scans.reportId, fx.reportId));
    expect(rows).toHaveLength(3);

    await teardown(fx);
  });
});
