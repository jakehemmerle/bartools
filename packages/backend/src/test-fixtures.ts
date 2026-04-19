import { basename, extname } from 'node:path';
import { db } from './db';
import {
  inferenceJobs,
  locations,
  reportRecords,
  reports,
  scans,
  users,
  venueMembers,
  venues,
} from './schema';

export const TEST_GCS_BUCKET = 'test-bucket';

// Build a synthetic GCS object key for tests. test-setup's
// @google-cloud/storage stub reads the object path from
// packages/backend/data/uploads/<object>, so the test is responsible for
// staging bytes at that location before inference runs.
export function buildTestGcsObject(reportId: string, srcFilename: string): {
  bucket: string;
  object: string;
} {
  const ext = extname(srcFilename) || '.jpg';
  const stem = basename(srcFilename, ext);
  const object = `reports/${reportId}/${stem}-${crypto.randomUUID()}${ext}`;
  return { bucket: TEST_GCS_BUCKET, object };
}

export type TestIds = {
  userId: string;
  venueId: string;
  locationId: string;
  reportId: string;
  scanId: string;
  jobId: string;
  recordId: string;
  photoBucket: string;
  photoObject: string;
};

export async function seedTestScenario(opts: {
  bucket: string;
  object: string;
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
    photoBucket: opts.bucket,
    photoObject: opts.object,
  };
}
