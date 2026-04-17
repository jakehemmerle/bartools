import { count, eq, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './db';
import { inferenceJobs, reportRecords, reports, scans } from './schema';
import { getBucketName } from './storage';

export const createReportSchema = z.object({
  userId: z.string().uuid(),
  venueId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
});

export type ReportScanInferencePayload = {
  jobId: string;
  reportId: string;
  scanId: string;
};

export async function createReport(input: z.infer<typeof createReportSchema>) {
  const [report] = await db
    .insert(reports)
    .values(input)
    .returning();

  return report;
}

export async function addReportPhotos(
  reportId: string,
  uploads: Array<{ object: string; sortOrder: number }>
) {
  const [report] = await db
    .select({
      id: reports.id,
      userId: reports.userId,
      venueId: reports.venueId,
      locationId: reports.locationId,
      status: reports.status,
    })
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!report) {
    throw new Error('report_not_found');
  }

  if (report.status !== 'created') {
    throw new Error('report_not_editable');
  }

  if (uploads.length === 0) {
    return [];
  }

  const bucket = getBucketName();
  const rows = uploads.map((upload) => ({
    reportId,
    userId: report.userId,
    venueId: report.venueId,
    locationId: report.locationId,
    photoGcsBucket: bucket,
    photoGcsObject: upload.object,
    sortOrder: upload.sortOrder,
  }));

  // Idempotent on scans.photoGcsObject: a retried /complete (flaky network,
  // app resume, etc.) lands on the existing row instead of duplicating.
  // onConflictDoNothing skips returning existing rows, so we select by the
  // full object list below.
  await db
    .insert(scans)
    .values(rows)
    .onConflictDoNothing({ target: scans.photoGcsObject });

  const objects = uploads.map((u) => u.object);
  const resolved = await db.select().from(scans).where(inArray(scans.photoGcsObject, objects));
  const byObject = new Map(resolved.map((scan) => [scan.photoGcsObject, scan]));

  const [{ totalCount }] = await db
    .select({ totalCount: count(scans.id) })
    .from(scans)
    .where(eq(scans.reportId, reportId));

  await db
    .update(reports)
    .set({ photoCount: Number(totalCount) })
    .where(eq(reports.id, reportId));

  // Preserve request order so response[i] corresponds to uploads[i].
  return uploads.map((u) => byObject.get(u.object)!);
}

export async function submitReport(reportId: string): Promise<ReportScanInferencePayload[]> {
  return db.transaction(async (tx) => {
    const [report] = await tx
      .select({
        id: reports.id,
        status: reports.status,
      })
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    if (!report) {
      throw new Error('report_not_found');
    }

    if (report.status !== 'created') {
      throw new Error('report_not_submittable');
    }

    const reportScans = await tx
      .select({
        id: scans.id,
      })
      .from(scans)
      .where(eq(scans.reportId, reportId));

    if (reportScans.length === 0) {
      throw new Error('report_has_no_photos');
    }

    const queuedAt = new Date();
    const recordRows = reportScans.map((scan) => ({
      reportId,
      scanId: scan.id,
      status: 'pending' as const,
      createdAt: queuedAt,
      updatedAt: queuedAt,
    }));

    const jobRows = reportScans.map((scan) => ({
      reportId,
      scanId: scan.id,
      status: 'queued' as const,
      provider: 'anthropic',
      jobKey: `${reportId}:${scan.id}`,
      queuedAt,
      createdAt: queuedAt,
      updatedAt: queuedAt,
    }));

    const createdJobs = await tx.insert(inferenceJobs).values(jobRows).returning({
      jobId: inferenceJobs.id,
      reportId: inferenceJobs.reportId,
      scanId: inferenceJobs.scanId,
    });

    await tx.insert(reportRecords).values(recordRows);
    await tx
      .update(reports)
      .set({
        status: 'processing',
        photoCount: reportScans.length,
        processedCount: 0,
      })
      .where(eq(reports.id, reportId));

    return createdJobs;
  });
}

export async function syncReportProgress(reportId: string) {
  const [scanTotals] = await db
    .select({
      photoCount: count(scans.id),
      processedCount: sql<number>`
        count(*) filter (
          where ${inferenceJobs.status} in ('succeeded', 'failed')
        )
      `,
    })
    .from(scans)
    .leftJoin(inferenceJobs, eq(inferenceJobs.scanId, scans.id))
    .where(eq(scans.reportId, reportId));

  const photoCount = Number(scanTotals?.photoCount ?? 0);
  const processedCount = Number(scanTotals?.processedCount ?? 0);

  const nextStatus = photoCount > 0 && processedCount >= photoCount ? 'unreviewed' : 'processing';

  await db
    .update(reports)
    .set({
      photoCount,
      processedCount,
      status: nextStatus,
    })
    .where(eq(reports.id, reportId));

  return {
    photoCount,
    processedCount,
    status: nextStatus,
  };
}
