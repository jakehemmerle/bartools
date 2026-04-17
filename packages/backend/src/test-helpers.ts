import { resolve } from 'node:path';
import { mkdir, rm, copyFile } from 'node:fs/promises';
import { eq, inArray } from 'drizzle-orm';
import { parseCsvRows } from '@bartools/inference';
import { db } from './db';
import {
  bottles,
  inferenceJobs,
  locations,
  reportRecords,
  reports,
  scans,
  users,
  venueMembers,
  venues,
} from './schema';

const REPO_ROOT = resolve(import.meta.dir, '../../..');
const ASSETS_DIR = resolve(REPO_ROOT, 'assets');
const TEST_UPLOAD_DIR = resolve(import.meta.dir, '../data/test-uploads');

// Tests that use copyTestPhoto pair with a `./storage` module mock that reads
// the file at `diskPathForObject(object)`. Keep the basename of the object
// key stable between the two so the mock doesn't need a registry.
export const TEST_BUCKET = 'bartools-test-uploads';

export function diskPathForObject(object: string): string {
  const basename = object.split('/').pop() ?? object;
  return resolve(TEST_UPLOAD_DIR, basename);
}

// ─── CSV parsing ────────────────────────────────────────────────────

type CatalogRow = {
  name: string;
  sizeMl: number | null;
  category: string;
};

const SIZE_MAP: Record<string, number> = {
  '750ml': 750,
  '700ml': 700,
  '1 liter': 1000,
  '1.75 liter': 1750,
  quart: 946,
  gallon: 3785,
};

const CATEGORY_MAP: Record<string, string> = {
  whisky: 'whiskey',
  batch: 'other',
  ice: 'other',
  'n/a thc': 'other',
  liq: 'liqueur',
};

export function parseCatalogCsv(csvText: string): CatalogRow[] {
  const rows = parseCsvRows(csvText);
  if (rows.length === 0) return [];

  const seen = new Set<string>();
  const result: CatalogRow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row?.length === 1 && row[0] === '') continue;

    const name = (row?.[1] ?? '').trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);

    const rawSize = (row?.[0] ?? '').trim().toLowerCase();
    const sizeMl = SIZE_MAP[rawSize] ?? null;

    const rawType = (row?.[2] ?? '').trim().toLowerCase();
    const category = CATEGORY_MAP[rawType] ?? rawType;

    result.push({ name, sizeMl, category });
  }

  return result.sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Seed bottles ───────────────────────────────────────────────────

export async function seedBottleCatalog() {
  const csvText = await Bun.file(resolve(ASSETS_DIR, 'verbena_simple.csv')).text();
  const parsed = parseCatalogCsv(csvText);

  const values = parsed.map((row) => ({
    name: row.name,
    category: row.category as typeof bottles.$inferInsert.category,
    sizeMl: row.sizeMl,
  }));

  const inserted = await db.insert(bottles).values(values).returning();
  return inserted;
}

// ─── Copy photo ─────────────────────────────────────────────────────

export async function copyTestPhoto(
  reportId: string,
  srcFilename: string
): Promise<{ object: string; bucket: string; diskPath: string }> {
  await mkdir(TEST_UPLOAD_DIR, { recursive: true });
  const object = `reports/${reportId}/${crypto.randomUUID()}.jpg`;
  const diskPath = diskPathForObject(object);
  await copyFile(resolve(ASSETS_DIR, 'photos', srcFilename), diskPath);
  return { object, bucket: TEST_BUCKET, diskPath };
}

// ─── Seed scenario ──────────────────────────────────────────────────

export type TestIds = {
  userId: string;
  venueId: string;
  locationId: string;
  reportId: string;
  scanId: string;
  jobId: string;
  recordId: string;
  photoPath: string;
};

export async function seedTestScenario(opts: {
  object: string;
  bucket: string;
  diskPath: string;
}): Promise<TestIds> {
  const [user] = await db
    .insert(users)
    .values({ email: `test-${crypto.randomUUID()}@bartools.test` })
    .returning();

  const [venue] = await db
    .insert(venues)
    .values({ name: 'Test Venue' })
    .returning();

  await db.insert(venueMembers).values({
    venueId: venue.id,
    userId: user.id,
  });

  const [location] = await db
    .insert(locations)
    .values({ venueId: venue.id, name: 'Test Bar' })
    .returning();

  const [report] = await db
    .insert(reports)
    .values({
      userId: user.id,
      venueId: venue.id,
      locationId: location.id,
      status: 'processing',
      photoCount: 1,
      processedCount: 0,
    })
    .returning();

  const [scan] = await db
    .insert(scans)
    .values({
      reportId: report.id,
      userId: user.id,
      venueId: venue.id,
      locationId: location.id,
      photoGcsBucket: opts.bucket,
      photoGcsObject: opts.object,
      sortOrder: 0,
    })
    .returning();

  const [job] = await db
    .insert(inferenceJobs)
    .values({
      reportId: report.id,
      scanId: scan.id,
      status: 'queued',
      provider: 'anthropic',
      jobKey: `${report.id}:${scan.id}`,
    })
    .returning();

  const [record] = await db
    .insert(reportRecords)
    .values({
      reportId: report.id,
      scanId: scan.id,
      status: 'pending',
    })
    .returning();

  return {
    userId: user.id,
    venueId: venue.id,
    locationId: location.id,
    reportId: report.id,
    scanId: scan.id,
    jobId: job.id,
    recordId: record.id,
    photoPath: opts.diskPath,
  };
}

// ─── Cleanup ────────────────────────────────────────────────────────

export async function cleanup(opts: {
  ids: TestIds;
  bottleIds: string[];
}) {
  const { ids, bottleIds } = opts;

  // scans must be deleted before reports (FK without cascade)
  // but inferenceJobs/reportRecords reference scans with cascade,
  // so delete reports first to cascade those, then delete scans
  // Actually: scans FK -> reports prevents deleting reports first.
  // Delete in child-first order:
  await db.delete(inferenceJobs).where(eq(inferenceJobs.reportId, ids.reportId));
  await db.delete(reportRecords).where(eq(reportRecords.reportId, ids.reportId));
  await db.delete(scans).where(eq(scans.reportId, ids.reportId));
  await db.delete(reports).where(eq(reports.id, ids.reportId));

  await db.delete(locations).where(eq(locations.venueId, ids.venueId));
  await db.delete(venueMembers).where(eq(venueMembers.userId, ids.userId));
  await db.delete(venues).where(eq(venues.id, ids.venueId));
  await db.delete(users).where(eq(users.id, ids.userId));

  if (bottleIds.length > 0) {
    await db.delete(bottles).where(inArray(bottles.id, bottleIds));
  }

  await rm(ids.photoPath, { force: true });
}
