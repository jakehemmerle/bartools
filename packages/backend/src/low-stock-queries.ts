import { and, asc, eq, lte } from 'drizzle-orm';
import type { LowStockAlert } from '@bartools/types';
import { db } from './db';
import { bottles, inventory, locations } from './schema';

// Returns the set of inventory rows where current fill is at or below the
// per-row par threshold, scoped to one venue. Ordered lowest-fill first so
// the most urgent alerts render at the top of the UI.
export async function listLowStockAlerts(
  venueId: string
): Promise<LowStockAlert[]> {
  const rows = await db
    .select({
      bottleId: inventory.bottleId,
      bottleName: bottles.name,
      locationId: inventory.locationId,
      locationName: locations.name,
      fillLevelTenths: inventory.fillLevelTenths,
      parThreshold: inventory.parThreshold,
    })
    .from(inventory)
    .innerJoin(locations, eq(locations.id, inventory.locationId))
    .innerJoin(bottles, eq(bottles.id, inventory.bottleId))
    .where(
      and(
        eq(locations.venueId, venueId),
        lte(inventory.fillLevelTenths, inventory.parThreshold)
      )
    )
    .orderBy(asc(inventory.fillLevelTenths), asc(bottles.name));

  return rows.map((row) => ({
    bottle: { id: row.bottleId, name: row.bottleName },
    location: { id: row.locationId, name: row.locationName },
    fillPercent: row.fillLevelTenths * 10,
    parPercent: row.parThreshold * 10,
  }));
}
