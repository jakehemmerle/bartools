import { resolve } from 'node:path';
import { eq, inArray } from 'drizzle-orm';
import { parseCsvRows } from '@bartools/inference';
import { db, pool } from './db';
import {
  bottles,
  inferenceAttempts,
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
const CATALOG_CSV = resolve(ASSETS_DIR, 'verbena_simple.csv');
const SOLUTIONS_JSONL = resolve(ASSETS_DIR, 'verbena_simple_predictions.jsonl');

// Deterministic demo identity — pinned UUIDs so the mobile app's hardcoded
// DEFAULT_USER_ID / DEFAULT_VENUE_ID in packages/mobile/lib/config.ts resolve
// to real rows. Keep these two files in sync until mobile picks its tenant
// from auth context.
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_VENUE_ID = '00000000-0000-0000-0000-000000000002';
export const DEMO_LOCATION_IDS = {
  'Main Bar': '00000000-0000-0000-0000-000000000011',
  Backstock: '00000000-0000-0000-0000-000000000012',
} as const;

const DEMO_EMAIL = 'demo@bartools.test';
const DEMO_VENUE = 'Demo Bar';
const DEMO_LOCATIONS = ['Main Bar', 'Backstock'] as const;
const DEMO_REPORT_NOTES_PREFIX = 'demo-seed';

// ─── Bottle catalog ─────────────────────────────────────────────────

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

type CatalogRow = {
  name: string;
  sizeMl: number | null;
  category: string;
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
    if (!name) continue;

    const rawSize = (row?.[0] ?? '').trim().toLowerCase();
    const sizeMl = SIZE_MAP[rawSize] ?? null;

    // (name, sizeMl) is the real identity — the CSV has intentional size
    // variants of the same product (e.g. Bulleit Bourbon at 750ml and 1L).
    // sizeMl=null in the key so repeated sizeless rows still collapse.
    const key = `${name}::${sizeMl ?? 'null'}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const rawType = (row?.[2] ?? '').trim().toLowerCase();
    const category = CATEGORY_MAP[rawType] ?? rawType;

    result.push({ name, sizeMl, category });
  }

  return result.sort(
    (a, b) => a.name.localeCompare(b.name) || (a.sizeMl ?? 0) - (b.sizeMl ?? 0),
  );
}

export async function seedBottles(): Promise<{ inserted: number; total: number }> {
  const csvText = await Bun.file(CATALOG_CSV).text();
  const parsed = parseCatalogCsv(csvText);

  const values = parsed.map((row) => ({
    name: row.name,
    category: row.category as typeof bottles.$inferInsert.category,
    sizeMl: row.sizeMl,
  }));

  const inserted = await db
    .insert(bottles)
    .values(values)
    .onConflictDoNothing({ target: [bottles.name, bottles.sizeMl] })
    .returning({ id: bottles.id });

  return { inserted: inserted.length, total: parsed.length };
}

// ─── Demo tenant ────────────────────────────────────────────────────

export type DemoIds = {
  userId: string;
  venueId: string;
  locationIds: Record<(typeof DEMO_LOCATIONS)[number], string>;
};

export async function seedDemoTenant(): Promise<{ ids: DemoIds; created: number }> {
  let created = 0;

  const [userRow] = await db
    .insert(users)
    .values({ id: DEMO_USER_ID, email: DEMO_EMAIL, displayName: 'Demo User' })
    .onConflictDoNothing({ target: users.id })
    .returning({ id: users.id });
  if (userRow) created++;

  const [venueRow] = await db
    .insert(venues)
    .values({ id: DEMO_VENUE_ID, name: DEMO_VENUE })
    .onConflictDoNothing({ target: venues.id })
    .returning({ id: venues.id });
  if (venueRow) created++;

  await db
    .insert(venueMembers)
    .values({ venueId: DEMO_VENUE_ID, userId: DEMO_USER_ID })
    .onConflictDoNothing();

  const locationIds = {} as DemoIds['locationIds'];
  for (const name of DEMO_LOCATIONS) {
    const [locRow] = await db
      .insert(locations)
      .values({ id: DEMO_LOCATION_IDS[name], venueId: DEMO_VENUE_ID, name })
      .onConflictDoNothing({ target: locations.id })
      .returning({ id: locations.id });

    if (locRow) created++;
    locationIds[name] = DEMO_LOCATION_IDS[name];
  }

  return {
    ids: { userId: DEMO_USER_ID, venueId: DEMO_VENUE_ID, locationIds },
    created,
  };
}

// Wipe the demo tenant's rows (user/venue + all dependent scans/reports/etc.)
// Scoped by the demo email and venue name so it safely runs on any environment
// that has the demo tenant, regardless of what UUIDs it happens to hold.
export async function resetDemoTenant(): Promise<{ deleted: number }> {
  let deleted = 0;

  const demoUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO_EMAIL));
  const demoVenues = await db
    .select({ id: venues.id })
    .from(venues)
    .where(eq(venues.name, DEMO_VENUE));

  const userIds = demoUsers.map((u) => u.id);
  const venueIds = demoVenues.map((v) => v.id);

  // scans → reports FK has no cascade, so delete scans before reports.
  // report_records + inference_jobs cascade off scans; inference_attempts
  // cascade off inference_jobs; inventory cascades off locations.
  if (venueIds.length > 0) {
    const scanDel = await db
      .delete(scans)
      .where(inArray(scans.venueId, venueIds))
      .returning({ id: scans.id });
    deleted += scanDel.length;

    const reportDel = await db
      .delete(reports)
      .where(inArray(reports.venueId, venueIds))
      .returning({ id: reports.id });
    deleted += reportDel.length;

    const venueDel = await db
      .delete(venues)
      .where(inArray(venues.id, venueIds))
      .returning({ id: venues.id });
    deleted += venueDel.length;
  }

  if (userIds.length > 0) {
    const userDel = await db
      .delete(users)
      .where(inArray(users.id, userIds))
      .returning({ id: users.id });
    deleted += userDel.length;
  }

  return { deleted };
}

// ─── Sample reports ─────────────────────────────────────────────────

type SolutionRow = {
  file: string;
  name: string;
  size?: string;
  volume: number;
};

async function loadSolutions(): Promise<SolutionRow[]> {
  const text = await Bun.file(SOLUTIONS_JSONL).text();
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as SolutionRow);
}

const SAMPLE_PHOTOS = ['IMG_3975.jpg', 'IMG_3982.jpg', 'IMG_3983.jpg'] as const;

export async function seedSampleReports(
  demo: DemoIds
): Promise<{ created: number; skipped: number; reason?: string }> {
  const bucket = process.env.GCS_BUCKET;
  if (!bucket) {
    return {
      created: 0,
      skipped: SAMPLE_PHOTOS.length,
      reason: 'GCS_BUCKET not set; skipping sample reports',
    };
  }

  const solutions = await loadSolutions();
  const solutionByFile = new Map(solutions.map((s) => [s.file, s]));
  const locationId = demo.locationIds['Main Bar'];

  let created = 0;
  let skipped = 0;

  for (const photo of SAMPLE_PHOTOS) {
    const solution = solutionByFile.get(photo);
    if (!solution) {
      skipped++;
      continue;
    }

    const gcsObject = `${DEMO_REPORT_NOTES_PREFIX}/${photo}`;

    // Idempotency: skip if a scan with this object already exists.
    const existing = await db
      .select({ id: scans.id })
      .from(scans)
      .where(eq(scans.photoGcsObject, gcsObject))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    // Solutions JSONL has no size info; for names with multiple size variants
    // (e.g. Rittenhouse Rye at 750ml/1L), pick the smallest deterministically.
    // NULLS LAST is Postgres's ASC default, so sizeless rows fall through.
    const [bottleRow] = await db
      .select({ id: bottles.id, category: bottles.category, sizeMl: bottles.sizeMl, name: bottles.name })
      .from(bottles)
      .where(eq(bottles.name, solution.name))
      .orderBy(bottles.sizeMl)
      .limit(1);

    const fillTenths = Math.round(solution.volume * 10);
    const now = new Date();

    await db.transaction(async (tx) => {
      const [report] = await tx
        .insert(reports)
        .values({
          userId: demo.userId,
          venueId: demo.venueId,
          locationId,
          status: 'reviewed',
          photoCount: 1,
          processedCount: 1,
          startedAt: now,
          reviewedAt: now,
        })
        .returning({ id: reports.id });

      const [scan] = await tx
        .insert(scans)
        .values({
          reportId: report.id,
          userId: demo.userId,
          venueId: demo.venueId,
          locationId,
          bottleId: bottleRow?.id ?? null,
          photoGcsBucket: bucket,
          photoGcsObject: gcsObject,
          sortOrder: 0,
          vlmFillTenths: fillTenths,
          modelUsed: 'claude-sonnet-4-6',
          rawResponse: { name: solution.name, volume: solution.volume },
          scannedAt: now,
        })
        .returning({ id: scans.id });

      const [job] = await tx
        .insert(inferenceJobs)
        .values({
          reportId: report.id,
          scanId: scan.id,
          status: 'succeeded',
          provider: 'anthropic',
          jobKey: `${report.id}:${scan.id}`,
          queuedAt: now,
          startedAt: now,
          finishedAt: now,
        })
        .returning({ id: inferenceJobs.id });

      await tx.insert(inferenceAttempts).values({
        jobId: job.id,
        attemptNumber: 1,
        modelUsed: 'claude-sonnet-4-6',
        promptName: 'verbena-simple-eval',
        promptResolvedVersion: 'demo-seed',
        latencyMs: 0,
        rawResponse: { name: solution.name, volume: solution.volume },
        startedAt: now,
        finishedAt: now,
      });

      await tx.insert(reportRecords).values({
        reportId: report.id,
        scanId: scan.id,
        status: 'reviewed',
        originalBottleId: bottleRow?.id ?? null,
        originalBottleName: solution.name,
        originalCategory: bottleRow?.category ?? null,
        originalVolumeMl: bottleRow?.sizeMl ?? null,
        originalFillTenths: fillTenths,
        correctedBottleId: bottleRow?.id ?? null,
        correctedBottleName: solution.name,
        correctedCategory: bottleRow?.category ?? null,
        correctedVolumeMl: bottleRow?.sizeMl ?? null,
        correctedFillTenths: fillTenths,
        correctedByUserId: demo.userId,
        inferredAt: now,
        correctedAt: now,
      });
    });

    created++;
  }

  return { created, skipped };
}

// ─── CLI ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const shouldReset = process.argv.includes('--reset');

  if (shouldReset) {
    const { deleted } = await resetDemoTenant();
    console.log(`demo tenant reset: -${deleted} rows`);
  }

  const bottleResult = await seedBottles();
  console.log(
    `bottles: +${bottleResult.inserted} inserted (${bottleResult.total - bottleResult.inserted} skipped)`
  );

  const demoResult = await seedDemoTenant();
  console.log(`demo tenant: +${demoResult.created} rows (user/venue/locations)`);

  const reportResult = await seedSampleReports(demoResult.ids);
  if (reportResult.reason) {
    console.log(`sample reports: skipped — ${reportResult.reason}`);
  } else {
    console.log(
      `sample reports: +${reportResult.created} created (${reportResult.skipped} skipped)`
    );
  }

  await pool.end();
}

if (import.meta.main) {
  await main();
}
