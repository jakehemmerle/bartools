import { asc, eq } from 'drizzle-orm';
import type { InventoryListItem } from '@bartools/types';
import { db } from './db';
import { bottles, inventory, locations } from './schema';
import { toIso } from './report-record-helpers';

// Columns returned by our venue/location queries. Keep a single column object so
// the join shape stays consistent across helpers.
const selectCols = {
  id: inventory.id,
  locationId: inventory.locationId,
  locationName: locations.name,
  bottleId: inventory.bottleId,
  name: bottles.name,
  category: bottles.category,
  subcategory: bottles.subcategory,
  sizeMl: bottles.sizeMl,
  fillLevelTenths: inventory.fillLevelTenths,
  lastScannedAt: inventory.lastScannedAt,
  notes: inventory.notes,
  addedAt: inventory.addedAt,
} as const;

type InventoryRow = {
  id: string;
  locationId: string;
  locationName: string;
  bottleId: string;
  name: string;
  category: typeof bottles.$inferSelect.category;
  subcategory: string | null;
  sizeMl: number | null;
  fillLevelTenths: number;
  lastScannedAt: Date | null;
  notes: string | null;
  addedAt: Date;
};

function toListItem(row: InventoryRow): InventoryListItem {
  return {
    id: row.id,
    locationId: row.locationId,
    locationName: row.locationName,
    bottleId: row.bottleId,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    sizeMl: row.sizeMl ?? undefined,
    fillPercent: row.fillLevelTenths * 10,
    lastScannedAt: toIso(row.lastScannedAt),
    notes: row.notes ?? undefined,
    addedAt: toIso(row.addedAt)!,
  };
}

export async function listInventoryForVenue(
  venueId: string
): Promise<InventoryListItem[]> {
  const rows = await db
    .select(selectCols)
    .from(inventory)
    .innerJoin(locations, eq(locations.id, inventory.locationId))
    .innerJoin(bottles, eq(bottles.id, inventory.bottleId))
    .where(eq(locations.venueId, venueId))
    .orderBy(asc(bottles.category), asc(bottles.name));

  return rows.map(toListItem);
}

export async function listInventoryForLocation(
  locationId: string
): Promise<InventoryListItem[]> {
  const rows = await db
    .select(selectCols)
    .from(inventory)
    .innerJoin(locations, eq(locations.id, inventory.locationId))
    .innerJoin(bottles, eq(bottles.id, inventory.bottleId))
    .where(eq(inventory.locationId, locationId))
    .orderBy(asc(bottles.category), asc(bottles.name));

  return rows.map(toListItem);
}

export type UpsertInventoryInput = {
  locationId: string;
  bottleId: string;
  fillLevelTenths: number;
  notes?: string;
};

// Manual-add path: no photo/scan context. Validates location + bottle exist
// before upserting on (location_id, bottle_id). Returns the written row shaped
// as an InventoryListItem so routes can echo it straight back.
export async function upsertInventoryItem(
  input: UpsertInventoryInput
): Promise<InventoryListItem> {
  const clamped = Math.max(0, Math.min(10, Math.trunc(input.fillLevelTenths)));

  const [location] = await db
    .select({ id: locations.id })
    .from(locations)
    .where(eq(locations.id, input.locationId))
    .limit(1);
  if (!location) {
    throw new Error('location_not_found');
  }

  const [bottle] = await db
    .select({ id: bottles.id })
    .from(bottles)
    .where(eq(bottles.id, input.bottleId))
    .limit(1);
  if (!bottle) {
    throw new Error('bottle_not_found');
  }

  const [upserted] = await db
    .insert(inventory)
    .values({
      locationId: input.locationId,
      bottleId: input.bottleId,
      fillLevelTenths: clamped,
      notes: input.notes,
    })
    .onConflictDoUpdate({
      target: [inventory.locationId, inventory.bottleId],
      set: {
        fillLevelTenths: clamped,
        notes: input.notes ?? null,
      },
    })
    .returning({ id: inventory.id });

  const [row] = await db
    .select(selectCols)
    .from(inventory)
    .innerJoin(locations, eq(locations.id, inventory.locationId))
    .innerJoin(bottles, eq(bottles.id, inventory.bottleId))
    .where(eq(inventory.id, upserted.id))
    .limit(1);

  return toListItem(row);
}
