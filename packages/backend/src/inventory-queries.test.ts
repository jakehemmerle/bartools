import { describe, test, expect, mock } from 'bun:test';
import { eq } from 'drizzle-orm';

// Stub storage so any transitive imports don't require live GCS config.
mock.module('./storage', () => ({
  getBucketName: () => 'test-bucket',
  getTtlSeconds: () => 300,
  presignPut: async () => ({ putUrl: '', expiresAt: new Date() }),
  presignGet: async () => ({ getUrl: '', expiresAt: new Date() }),
  getObjectBytes: async () => new Uint8Array(),
}));

import { db } from './db';
import {
  listInventoryForVenue,
  listInventoryForLocation,
  upsertInventoryItem,
} from './inventory-queries';
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
    .values({ email: `inv-${crypto.randomUUID()}@bartools.test` })
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
  upc?: string;
}) {
  const [row] = await db
    .insert(bottles)
    .values({
      name: values.name,
      category: values.category,
      subcategory: values.subcategory,
      sizeMl: values.sizeMl,
      upc: values.upc,
    })
    .returning();
  return row;
}

describe('listInventoryForVenue', () => {
  test('returns empty array when venue has no inventory', async () => {
    const fx = await seedVenue(['Main Bar']);
    const result = await listInventoryForVenue(fx.venueId);
    expect(result).toEqual([]);
  });

  test('returns single-location rows joined with bottle + location names', async () => {
    const fx = await seedVenue(['Main Bar']);
    const bottle = await seedBottle({
      name: 'Rittenhouse Rye',
      category: 'rye',
      subcategory: 'bottled-in-bond',
      sizeMl: 750,
    });

    const [row] = await db
      .insert(inventory)
      .values({
        locationId: fx.locationIds[0],
        bottleId: bottle.id,
        fillLevelTenths: 7,
      })
      .returning();

    const result = await listInventoryForVenue(fx.venueId);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: row.id,
      locationId: fx.locationIds[0],
      locationName: 'Main Bar',
      bottleId: bottle.id,
      name: 'Rittenhouse Rye',
      category: 'rye',
      subcategory: 'bottled-in-bond',
      sizeMl: 750,
      fillPercent: 70,
    });
    expect(typeof result[0].addedAt).toBe('string');
  });

  test('multi-location rows are ordered by category then name', async () => {
    const fx = await seedVenue(['Main Bar', 'Backstock']);

    const bourbon = await seedBottle({
      name: 'Buffalo Trace',
      category: 'bourbon',
      sizeMl: 750,
    });
    const rye = await seedBottle({
      name: 'Rittenhouse Rye',
      category: 'rye',
      sizeMl: 750,
    });
    const whiskeyA = await seedBottle({
      name: 'Suntory Toki',
      category: 'whiskey',
      sizeMl: 750,
    });
    const whiskeyB = await seedBottle({
      name: 'Hakushu 12Y',
      category: 'whiskey',
      sizeMl: 700,
    });

    await db.insert(inventory).values([
      { locationId: fx.locationIds[0], bottleId: bourbon.id, fillLevelTenths: 5 },
      { locationId: fx.locationIds[1], bottleId: rye.id, fillLevelTenths: 3 },
      { locationId: fx.locationIds[0], bottleId: whiskeyA.id, fillLevelTenths: 8 },
      { locationId: fx.locationIds[1], bottleId: whiskeyB.id, fillLevelTenths: 10 },
    ]);

    const result = await listInventoryForVenue(fx.venueId);
    const ordered = result.map((r) => `${r.category}:${r.name}`);

    // Postgres orders pg_enum values by their declaration index, not
    // alphabetically. schema.ts declares `whiskey, bourbon, rye` in that
    // order, so whiskey rows come first. Within a category, ASC by bottle
    // name: Hakushu 12Y < Suntory Toki.
    expect(ordered).toEqual([
      'whiskey:Hakushu 12Y',
      'whiskey:Suntory Toki',
      'bourbon:Buffalo Trace',
      'rye:Rittenhouse Rye',
    ]);

    const hakushu = result.find((r) => r.name === 'Hakushu 12Y')!;
    expect(hakushu.fillPercent).toBe(100);
  });
});

describe('listInventoryForLocation', () => {
  test('filters rows to the given location', async () => {
    const fx = await seedVenue(['Main Bar', 'Backstock']);
    const bottleA = await seedBottle({ name: 'A', category: 'gin', sizeMl: 750 });
    const bottleB = await seedBottle({ name: 'B', category: 'vodka', sizeMl: 750 });

    await db.insert(inventory).values([
      { locationId: fx.locationIds[0], bottleId: bottleA.id, fillLevelTenths: 4 },
      { locationId: fx.locationIds[1], bottleId: bottleB.id, fillLevelTenths: 2 },
    ]);

    const mainBar = await listInventoryForLocation(fx.locationIds[0]);
    expect(mainBar).toHaveLength(1);
    expect(mainBar[0].name).toBe('A');
    expect(mainBar[0].fillPercent).toBe(40);

    const backstock = await listInventoryForLocation(fx.locationIds[1]);
    expect(backstock).toHaveLength(1);
    expect(backstock[0].name).toBe('B');
  });

  test('returns [] for a location with nothing in inventory', async () => {
    const fx = await seedVenue(['Main Bar']);
    expect(await listInventoryForLocation(fx.locationIds[0])).toEqual([]);
  });
});

describe('upsertInventoryItem', () => {
  test('inserts when no row exists, returns joined shape', async () => {
    const fx = await seedVenue(['Main Bar']);
    const bottle = await seedBottle({
      name: 'Plymouth',
      category: 'gin',
      sizeMl: 750,
    });

    const result = await upsertInventoryItem({
      locationId: fx.locationIds[0],
      bottleId: bottle.id,
      fillLevelTenths: 6,
      notes: 'opened tuesday',
    });

    expect(result.locationId).toBe(fx.locationIds[0]);
    expect(result.locationName).toBe('Main Bar');
    expect(result.bottleId).toBe(bottle.id);
    expect(result.name).toBe('Plymouth');
    expect(result.category).toBe('gin');
    expect(result.sizeMl).toBe(750);
    expect(result.fillPercent).toBe(60);
    expect(result.notes).toBe('opened tuesday');

    const rows = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, result.id));
    expect(rows).toHaveLength(1);
  });

  test('updates existing row on unique conflict (no duplicates)', async () => {
    const fx = await seedVenue(['Main Bar']);
    const bottle = await seedBottle({
      name: 'Beefeater',
      category: 'gin',
      sizeMl: 750,
    });

    const first = await upsertInventoryItem({
      locationId: fx.locationIds[0],
      bottleId: bottle.id,
      fillLevelTenths: 3,
    });

    const second = await upsertInventoryItem({
      locationId: fx.locationIds[0],
      bottleId: bottle.id,
      fillLevelTenths: 9,
      notes: 'topped up',
    });

    expect(second.id).toBe(first.id);
    expect(second.fillPercent).toBe(90);
    expect(second.notes).toBe('topped up');

    const all = await db
      .select()
      .from(inventory)
      .where(eq(inventory.locationId, fx.locationIds[0]));
    expect(all).toHaveLength(1);
  });

  test('creates a catalog bottle from manual details before upserting inventory', async () => {
    const fx = await seedVenue(['Main Bar']);

    const result = await upsertInventoryItem({
      locationId: fx.locationIds[0],
      bottle: {
        name: 'Manual Amaro',
        category: 'amaro',
        sizeMl: 750,
      },
      fillLevelTenths: 4,
    });

    expect(result.name).toBe('Manual Amaro');
    expect(result.category).toBe('amaro');
    expect(result.sizeMl).toBe(750);
    expect(result.fillPercent).toBe(40);

    const bottleRows = await db
      .select()
      .from(bottles)
      .where(eq(bottles.id, result.bottleId));
    expect(bottleRows).toHaveLength(1);
  });

  test('manual details reuse an existing catalog bottle with the same name and size', async () => {
    const fx = await seedVenue(['Main Bar']);
    const existing = await seedBottle({
      name: 'Known Manual Bottle',
      category: 'gin',
      sizeMl: 750,
    });

    const result = await upsertInventoryItem({
      locationId: fx.locationIds[0],
      bottle: {
        name: 'Known Manual Bottle',
        category: 'other',
        sizeMl: 750,
      },
      fillLevelTenths: 8,
    });

    expect(result.bottleId).toBe(existing.id);
    expect(result.category).toBe('gin');
    expect(result.fillPercent).toBe(80);
  });

  test('manual details reuse an existing catalog bottle with the same UPC', async () => {
    const fx = await seedVenue(['Main Bar']);
    const existing = await seedBottle({
      name: 'Catalog UPC Bottle',
      category: 'tequila',
      sizeMl: 750,
      upc: `upc-${crypto.randomUUID()}`,
    });

    const result = await upsertInventoryItem({
      locationId: fx.locationIds[0],
      bottle: {
        name: 'Different Label Same UPC',
        category: 'other',
        sizeMl: 1000,
        upc: existing.upc!,
      },
      fillLevelTenths: 5,
    });

    expect(result.bottleId).toBe(existing.id);
    expect(result.name).toBe('Catalog UPC Bottle');
    expect(result.category).toBe('tequila');
    expect(result.fillPercent).toBe(50);
  });

  test('throws when location is missing', async () => {
    const fx = await seedVenue(['Main Bar']);
    const bottle = await seedBottle({ name: 'X', category: 'rum', sizeMl: 750 });

    const ghostLocation = crypto.randomUUID();
    await expect(
      upsertInventoryItem({
        locationId: ghostLocation,
        bottleId: bottle.id,
        fillLevelTenths: 5,
      })
    ).rejects.toThrow(/location_not_found/);
    // ensure nothing was inserted
    const rows = await db.select().from(inventory);
    expect(rows).toHaveLength(0);
    // Touch fx so the compiler doesn't complain about unused var in future edits.
    expect(fx.venueId).toBeTruthy();
  });

  test('throws when bottle is missing', async () => {
    const fx = await seedVenue(['Main Bar']);
    await expect(
      upsertInventoryItem({
        locationId: fx.locationIds[0],
        bottleId: crypto.randomUUID(),
        fillLevelTenths: 5,
      })
    ).rejects.toThrow(/bottle_not_found/);
  });
});
