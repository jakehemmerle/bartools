import { describe, expect, test } from 'bun:test';
import { eq } from 'drizzle-orm';
import { db } from './db';
import {
  bottles,
  inventory,
  reports,
  scans,
  users,
  venues,
} from './schema';
import {
  DEMO_USER_ID,
  DEMO_VENUE_ID,
  resetDemoTenant,
  seedDemoTenant,
} from './seed';

describe('demo tenant seed/reset', () => {
  test('replaces old random demo rows with pinned demo ids', async () => {
    await db
      .insert(users)
      .values({ email: 'demo@bartools.test', displayName: 'Old Demo User' });
    await db.insert(venues).values({ name: 'Demo Bar' });

    const result = await seedDemoTenant();

    expect(result.ids.userId).toBe(DEMO_USER_ID);
    expect(result.ids.venueId).toBe(DEMO_VENUE_ID);

    const demoUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, 'demo@bartools.test'));
    const demoVenues = await db
      .select({ id: venues.id })
      .from(venues)
      .where(eq(venues.name, 'Demo Bar'));

    expect(demoUsers.map((user) => user.id)).toEqual([DEMO_USER_ID]);
    expect(demoVenues.map((venue) => venue.id)).toEqual([DEMO_VENUE_ID]);
  });

  test('reset deletes inventory before scans so lastScanId cannot block cleanup', async () => {
    const { ids } = await seedDemoTenant();
    const [bottle] = await db
      .insert(bottles)
      .values({ name: `Reset Bottle ${crypto.randomUUID()}`, category: 'gin' })
      .returning();

    const [report] = await db
      .insert(reports)
      .values({
        userId: ids.userId,
        venueId: ids.venueId,
        locationId: ids.locationIds['Main Bar'],
        status: 'reviewed',
      })
      .returning();
    const [scan] = await db
      .insert(scans)
      .values({
        reportId: report.id,
        userId: ids.userId,
        venueId: ids.venueId,
        locationId: ids.locationIds['Main Bar'],
        bottleId: bottle.id,
        photoGcsBucket: 'test-bucket',
        photoGcsObject: `demo-seed/${crypto.randomUUID()}.jpg`,
      })
      .returning();
    await db.insert(inventory).values({
      locationId: ids.locationIds['Main Bar'],
      bottleId: bottle.id,
      fillLevelTenths: 5,
      lastScanId: scan.id,
    });

    const reset = await resetDemoTenant();
    expect(reset.deleted).toBeGreaterThan(0);

    expect(await db.select().from(inventory)).toHaveLength(0);
    expect(await db.select().from(scans)).toHaveLength(0);
    expect(await db.select().from(reports)).toHaveLength(0);
    expect(await db.select().from(venues).where(eq(venues.id, ids.venueId))).toHaveLength(0);
    expect(await db.select().from(users).where(eq(users.id, ids.userId))).toHaveLength(0);
  });
});
