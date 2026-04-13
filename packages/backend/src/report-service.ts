import { count, desc, eq, ilike, inArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './db';
import {
  bottles,
  inferenceJobs,
  locations,
  reportRecords,
  reports,
  scans,
  users,
} from './schema';
import { saveUploadedPhoto } from './uploads';

export const createReportSchema = z.object({
  userId: z.string().uuid(),
  venueId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
});

export const reviewRecordSchema = z.object({
  id: z.string().uuid(),
  bottleId: z.string().uuid(),
  fillTenths: z.number().int().min(0).max(10),
});

export const reviewReportSchema = z.object({
  userId: z.string().uuid(),
  records: z.array(reviewRecordSchema).min(1),
});

export type ReportScanInferencePayload = {
  jobId: string;
  reportId: string;
  scanId: string;
};

function toIso(value: Date | null | undefined): string | undefined {
  return value?.toISOString();
}

function maybeModelOutput(record: {
  originalBottleName: string | null;
  originalCategory: string | null;
  originalUpc: string | null;
  originalVolumeMl: number | null;
  originalFillTenths: number | null;
}) {
  const hasValue =
    record.originalBottleName !== null ||
    record.originalCategory !== null ||
    record.originalUpc !== null ||
    record.originalVolumeMl !== null ||
    record.originalFillTenths !== null;

  if (!hasValue) {
    return undefined;
  }

  return {
    bottleName: record.originalBottleName ?? undefined,
    category: record.originalCategory ?? undefined,
    upc: record.originalUpc ?? undefined,
    volumeMl: record.originalVolumeMl ?? undefined,
    fillPercent:
      record.originalFillTenths === null ? undefined : record.originalFillTenths * 10,
  };
}

function maybeCorrectedValues(record: {
  correctedBottleName: string | null;
  correctedCategory: string | null;
  correctedUpc: string | null;
  correctedVolumeMl: number | null;
  correctedFillTenths: number | null;
}) {
  const hasValue =
    record.correctedBottleName !== null ||
    record.correctedCategory !== null ||
    record.correctedUpc !== null ||
    record.correctedVolumeMl !== null ||
    record.correctedFillTenths !== null;

  if (!hasValue) {
    return undefined;
  }

  return {
    bottleName: record.correctedBottleName ?? undefined,
    category: record.correctedCategory ?? undefined,
    upc: record.correctedUpc ?? undefined,
    volumeMl: record.correctedVolumeMl ?? undefined,
    fillPercent:
      record.correctedFillTenths === null ? undefined : record.correctedFillTenths * 10,
  };
}

function wasCorrected(record: {
  originalBottleId: string | null;
  correctedBottleId: string | null;
  originalBottleName: string | null;
  correctedBottleName: string | null;
  originalCategory: string | null;
  correctedCategory: string | null;
  originalUpc: string | null;
  correctedUpc: string | null;
  originalVolumeMl: number | null;
  correctedVolumeMl: number | null;
  originalFillTenths: number | null;
  correctedFillTenths: number | null;
}) {
  if (record.correctedBottleId === null && record.correctedFillTenths === null) {
    return false;
  }

  return (
    record.originalBottleId !== record.correctedBottleId ||
    record.originalBottleName !== record.correctedBottleName ||
    record.originalCategory !== record.correctedCategory ||
    record.originalUpc !== record.correctedUpc ||
    record.originalVolumeMl !== record.correctedVolumeMl ||
    record.originalFillTenths !== record.correctedFillTenths
  );
}

export async function createReport(input: z.infer<typeof createReportSchema>) {
  const [report] = await db
    .insert(reports)
    .values(input)
    .returning();

  return report;
}

export async function addReportPhotos(reportId: string, files: File[]) {
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

  const [{ existingCount }] = await db
    .select({ existingCount: count(scans.id) })
    .from(scans)
    .where(eq(scans.reportId, reportId));

  const offset = Number(existingCount);
  const uploaded = [];

  for (const [index, file] of files.entries()) {
    const photoUrl = await saveUploadedPhoto(reportId, file);
    uploaded.push({
      reportId,
      userId: report.userId,
      venueId: report.venueId,
      locationId: report.locationId,
      photoUrl,
      sortOrder: offset + index,
    });
  }

  const created = uploaded.length
    ? await db.insert(scans).values(uploaded).returning()
    : [];

  const nextPhotoCount = offset + created.length;
  await db
    .update(reports)
    .set({ photoCount: nextPhotoCount })
    .where(eq(reports.id, reportId));

  return created;
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

export async function listReports() {
  const rows = await db
    .select({
      id: reports.id,
      startedAt: reports.startedAt,
      completedAt: reports.reviewedAt,
      userId: users.id,
      userDisplayName: users.displayName,
      bottleCount: count(scans.id),
      status: reports.status,
    })
    .from(reports)
    .leftJoin(users, eq(users.id, reports.userId))
    .leftJoin(scans, eq(scans.reportId, reports.id))
    .groupBy(reports.id, users.id)
    .orderBy(desc(sql`coalesce(${reports.reviewedAt}, ${reports.startedAt})`));

  return rows.map((row) => ({
    id: row.id,
    startedAt: toIso(row.startedAt),
    completedAt: toIso(row.completedAt),
    userId: row.userId ?? undefined,
    userDisplayName: row.userDisplayName ?? undefined,
    bottleCount: Number(row.bottleCount),
    status: row.status,
  }));
}

export async function getReportDetail(reportId: string) {
  const [header] = await db
    .select({
      id: reports.id,
      startedAt: reports.startedAt,
      completedAt: reports.reviewedAt,
      userId: users.id,
      userDisplayName: users.displayName,
      status: reports.status,
    })
    .from(reports)
    .leftJoin(users, eq(users.id, reports.userId))
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!header) {
    return null;
  }

  const rows = await db
    .select({
      id: reportRecords.id,
      status: reportRecords.status,
      imageUrl: scans.photoUrl,
      sortOrder: scans.sortOrder,
      originalBottleId: reportRecords.originalBottleId,
      originalBottleName: reportRecords.originalBottleName,
      originalCategory: reportRecords.originalCategory,
      originalUpc: reportRecords.originalUpc,
      originalVolumeMl: reportRecords.originalVolumeMl,
      originalFillTenths: reportRecords.originalFillTenths,
      correctedBottleId: reportRecords.correctedBottleId,
      correctedBottleName: reportRecords.correctedBottleName,
      correctedCategory: reportRecords.correctedCategory,
      correctedUpc: reportRecords.correctedUpc,
      correctedVolumeMl: reportRecords.correctedVolumeMl,
      correctedFillTenths: reportRecords.correctedFillTenths,
      errorCode: reportRecords.errorCode,
      errorMessage: reportRecords.errorMessage,
    })
    .from(reportRecords)
    .leftJoin(scans, eq(scans.id, reportRecords.scanId))
    .where(eq(reportRecords.reportId, reportId))
    .orderBy(scans.sortOrder, scans.scannedAt);

  return {
    id: header.id,
    startedAt: toIso(header.startedAt),
    completedAt: toIso(header.completedAt),
    userId: header.userId ?? undefined,
    userDisplayName: header.userDisplayName ?? undefined,
    status: header.status,
    bottleRecords: rows.map((row) => {
      const finalBottleName =
        row.correctedBottleName ?? row.originalBottleName ?? 'Unknown bottle';
      const finalCategory = row.correctedCategory ?? row.originalCategory ?? undefined;
      const finalUpc = row.correctedUpc ?? row.originalUpc ?? undefined;
      const finalVolumeMl = row.correctedVolumeMl ?? row.originalVolumeMl ?? undefined;
      const finalFillTenths = row.correctedFillTenths ?? row.originalFillTenths ?? 0;

      return {
        id: row.id,
        imageUrl: row.imageUrl ?? '',
        bottleName: finalBottleName,
        category: finalCategory,
        upc: finalUpc,
        volumeMl: finalVolumeMl,
        fillPercent: finalFillTenths * 10,
        corrected: wasCorrected(row),
        status: row.status,
        errorCode: row.errorCode ?? undefined,
        errorMessage: row.errorMessage ?? undefined,
        originalModelOutput: maybeModelOutput(row),
        correctedValues: maybeCorrectedValues(row),
      };
    }),
  };
}

export async function getReportStreamState(reportId: string) {
  const detail = await getReportDetail(reportId);

  if (!detail) {
    return null;
  }

  const [report] = await db
    .select({
      status: reports.status,
      photoCount: reports.photoCount,
      processedCount: reports.processedCount,
    })
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  return {
    report: {
      id: reportId,
      status: report?.status ?? detail.status,
      photoCount: report?.photoCount ?? detail.bottleRecords.length,
      processedCount: report?.processedCount ?? 0,
    },
    records: detail.bottleRecords,
  };
}

export async function reviewReport(
  reportId: string,
  input: z.infer<typeof reviewReportSchema>
) {
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

    if (report.status !== 'unreviewed') {
      throw new Error('report_not_reviewable');
    }

    const existingRecords = await tx
      .select({
        id: reportRecords.id,
        originalBottleId: reportRecords.originalBottleId,
        originalBottleName: reportRecords.originalBottleName,
        originalCategory: reportRecords.originalCategory,
        originalUpc: reportRecords.originalUpc,
        originalVolumeMl: reportRecords.originalVolumeMl,
        originalFillTenths: reportRecords.originalFillTenths,
      })
      .from(reportRecords)
      .where(eq(reportRecords.reportId, reportId));

    if (existingRecords.length !== input.records.length) {
      throw new Error('report_review_incomplete');
    }

    const recordMap = new Map(input.records.map((record) => [record.id, record]));

    for (const existing of existingRecords) {
      if (!recordMap.has(existing.id)) {
        throw new Error('report_review_incomplete');
      }
    }

    const bottleIds = [...new Set(input.records.map((record) => record.bottleId))];
    const resolvedBottles = await tx
      .select({
        id: bottles.id,
        name: bottles.name,
        category: bottles.category,
        upc: bottles.upc,
        sizeMl: bottles.sizeMl,
      })
      .from(bottles)
      .where(inArray(bottles.id, bottleIds));

    const bottleMap = new Map(
      resolvedBottles.map((bottle) => [bottle.id, bottle])
    );
    const now = new Date();

    for (const existing of existingRecords) {
      const reviewed = recordMap.get(existing.id);
      if (!reviewed) {
        continue;
      }

      const bottle = bottleMap.get(reviewed.bottleId);
      if (!bottle) {
        throw new Error('review_bottle_not_found');
      }

      await tx
        .update(reportRecords)
        .set({
          status: 'reviewed',
          correctedBottleId: bottle.id,
          correctedBottleName: bottle.name,
          correctedCategory: bottle.category,
          correctedUpc: bottle.upc,
          correctedVolumeMl: bottle.sizeMl,
          correctedFillTenths: reviewed.fillTenths,
          correctedByUserId: input.userId,
          correctedAt: now,
          updatedAt: now,
          errorCode: null,
          errorMessage: null,
        })
        .where(eq(reportRecords.id, existing.id));
    }

    await tx
      .update(reports)
      .set({
        status: 'reviewed',
        reviewedAt: now,
      })
      .where(eq(reports.id, reportId));
  });
}

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
  }));
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
  }));
}
