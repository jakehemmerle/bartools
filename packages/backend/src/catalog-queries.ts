import { eq, ilike, sql } from 'drizzle-orm';
import type { BottleSearchResult, LocationListItem } from '@bartools/types';
import { db } from './db';
import { bottles, locations } from './schema';
import { toIso } from './report-record-helpers';

export async function searchBottles(query: string) {
  const normalized = query.trim();
  const rows = await db
    .select({
      id: bottles.id,
      name: bottles.name,
      category: bottles.category,
      upc: bottles.upc,
      volumeMl: bottles.sizeMl,
    })
    .from(bottles)
    .where(
      normalized
        ? ilike(bottles.name, `%${normalized}%`)
        : sql`true`
    )
    .orderBy(bottles.name)
    .limit(20);

  return rows.map((row) => ({
    ...row,
    upc: row.upc ?? undefined,
    volumeMl: row.volumeMl ?? undefined,
  })) satisfies BottleSearchResult[];
}

export async function listVenueLocations(venueId: string) {
  const rows = await db
    .select({
      id: locations.id,
      name: locations.name,
      createdAt: locations.createdAt,
    })
    .from(locations)
    .where(eq(locations.venueId, venueId))
    .orderBy(locations.name);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    createdAt: toIso(row.createdAt),
  })) satisfies LocationListItem[];
}
