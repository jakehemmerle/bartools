import { describe, test, expect, mock } from 'bun:test';

// Stub storage so any transitive imports don't require live GCS config.
mock.module('./storage', () => ({
  getBucketName: () => 'test-bucket',
  getTtlSeconds: () => 300,
  presignPut: async () => ({ putUrl: '', expiresAt: new Date() }),
  presignGet: async () => ({ getUrl: '', expiresAt: new Date() }),
  getObjectBytes: async () => new Uint8Array(),
}));

import { db } from './db';
import { listLowStockAlerts } from './low-stock-queries';
import {
  bottles,
  inventory,
  locations,
  users,
  venueMembers,
  venues,
} from './schema';

type VenueFixture = {
  userId: string;
  venueId: string;
  locationIds: string[];
};

async function seedVenue(locationNames: string[]): Promise<VenueFixture> {
  const [user] = await db
    .insert(users)
    .values({ email: `low-stock-${crypto.randomUUID()}@bartools.test` })
    .returning();
  const [venue] = await db
    .insert(venues)
    .values({ name: `Venue ${crypto.randomUUID().slice(0, 8)}` })
    .returning();
  await db.insert(venueMembers).values({ venueId: venue.id, userId: user.id });

  const locationIds: string[] = [];
  for (const name of locationNames) {
    const [loc] = await db
      .insert(locations)
      .values({ venueId: venue.id, name })
      .returning();
    locationIds.push(loc.id);
  }

  return { userId: user.id, venueId: venue.id, locationIds };
}

async function seedBottle(values: {
  name: string;
  category: typeof bottles.$inferInsert.category;
  subcategory?: string;
  sizeMl?: number;
}) {
  const [row] = await db
    .insert(bottles)
    .values({
      name: values.name,
      category: values.category,
      subcategory: values.subcategory,
      sizeMl: values.sizeMl,
    })
    .returning();
  return row;
}

describe('listLowStockAlerts', () => {
  test('returns [] for a venue with no inventory', async () => {
    const fx = await seedVenue(['Main Bar']);
    expect(await listLowStockAlerts(fx.venueId)).toEqual([]);
  });

  test('returns only rows whose fill is at or below the par threshold', async () => {
    const fx = await seedVenue(['Main Bar', 'Backstock']);

    const below = await seedBottle({ name: 'Below', category: 'bourbon', sizeMl: 750 });
    const atThreshold = await seedBottle({ name: 'At Threshold', category: 'gin', sizeMl: 750 });
    const above = await seedBottle({ name: 'Above', category: 'rum', sizeMl: 750 });
    const far = await seedBottle({ name: 'Far Above', category: 'amaro', sizeMl: 750 });

    await db.insert(inventory).values([
      // fill=1, par=3 → below par (low stock)
      { locationId: fx.locationIds[0], bottleId: below.id, fillLevelTenths: 1, parThreshold: 3 },
      // fill=4, par=4 → exactly at par (counts as low stock)
      { locationId: fx.locationIds[0], bottleId: atThreshold.id, fillLevelTenths: 4, parThreshold: 4 },
      // fill=5, par=3 → above par (not low)
      { locationId: fx.locationIds[1], bottleId: above.id, fillLevelTenths: 5, parThreshold: 3 },
      // fill=9, par=3 → far above (not low)
      { locationId: fx.locationIds[1], bottleId: far.id, fillLevelTenths: 9, parThreshold: 3 },
    ]);

    const alerts = await listLowStockAlerts(fx.venueId);
    expect(alerts).toHaveLength(2);
    // Ordered by fillPercent ASC; 'Below' (10%) before 'At Threshold' (40%).
    expect(alerts[0]).toMatchObject({
      bottle: { id: below.id, name: 'Below' },
      location: { id: fx.locationIds[0], name: 'Main Bar' },
      fillPercent: 10,
      parPercent: 30,
    });
    expect(alerts[1]).toMatchObject({
      bottle: { id: atThreshold.id, name: 'At Threshold' },
      location: { id: fx.locationIds[0], name: 'Main Bar' },
      fillPercent: 40,
      parPercent: 40,
    });
  });

  test('orders by fillPercent ASC, then bottle.name ASC as tiebreaker', async () => {
    const fx = await seedVenue(['Main Bar']);

    const zBottle = await seedBottle({ name: 'Z Bottle', category: 'bourbon', sizeMl: 750 });
    const aBottle = await seedBottle({ name: 'A Bottle', category: 'gin', sizeMl: 750 });
    const mBottle = await seedBottle({ name: 'M Bottle', category: 'rum', sizeMl: 750 });

    await db.insert(inventory).values([
      // Same fill (2) for two rows; expect A < Z.
      { locationId: fx.locationIds[0], bottleId: zBottle.id, fillLevelTenths: 2, parThreshold: 3 },
      { locationId: fx.locationIds[0], bottleId: aBottle.id, fillLevelTenths: 2, parThreshold: 3 },
      // Lower fill (0) should come first regardless of name.
      { locationId: fx.locationIds[0], bottleId: mBottle.id, fillLevelTenths: 0, parThreshold: 3 },
    ]);

    const alerts = await listLowStockAlerts(fx.venueId);
    expect(alerts.map((a) => a.bottle.name)).toEqual(['M Bottle', 'A Bottle', 'Z Bottle']);
  });

  test('ignores rows from other venues', async () => {
    const [fx1, fx2] = await Promise.all([
      seedVenue(['Bar 1']),
      seedVenue(['Bar 2']),
    ]);

    const bottle = await seedBottle({ name: 'Shared', category: 'bourbon', sizeMl: 750 });

    await db.insert(inventory).values([
      { locationId: fx1.locationIds[0], bottleId: bottle.id, fillLevelTenths: 1, parThreshold: 3 },
      { locationId: fx2.locationIds[0], bottleId: bottle.id, fillLevelTenths: 1, parThreshold: 3 },
    ]);

    const alerts1 = await listLowStockAlerts(fx1.venueId);
    expect(alerts1).toHaveLength(1);
    expect(alerts1[0].location.id).toBe(fx1.locationIds[0]);

    const alerts2 = await listLowStockAlerts(fx2.venueId);
    expect(alerts2).toHaveLength(1);
    expect(alerts2[0].location.id).toBe(fx2.locationIds[0]);
  });
});
