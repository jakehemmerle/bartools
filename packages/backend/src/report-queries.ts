import { count, desc, eq, sql } from 'drizzle-orm';
import type { ReportDetail, ReportListItem } from '@bartools/types';
import { db } from './db';
import { reportRecords, reports, scans, users } from './schema';
import {
  toIso,
  maybeModelOutput,
  maybeCorrectedValues,
  wasCorrected,
} from './report-record-helpers';

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
  })) satisfies ReportListItem[];
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
  } satisfies ReportDetail;
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
