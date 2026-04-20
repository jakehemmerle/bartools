import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './db';
import { bottles, inventory, reportRecords, reports } from './schema';
import { findOrCreateBottle, manualBottleSchema } from './bottle-queries';
import { uuid } from './validators';

export const reviewRecordSchema = z.object({
  id: uuid(),
  fillTenths: z.number().int().min(0).max(10),
  bottleId: uuid().optional(),
  bottle: manualBottleSchema.optional(),
}).refine((record) => Boolean(record.bottleId) !== Boolean(record.bottle), {
  message: 'Provide exactly one of bottleId or bottle',
});

export const reviewReportSchema = z.object({
  userId: uuid(),
  records: z.array(reviewRecordSchema).min(1),
});

export async function reviewReport(
  reportId: string,
  input: z.infer<typeof reviewReportSchema>
) {
  return db.transaction(async (tx) => {
    const [report] = await tx
      .select({
        id: reports.id,
        status: reports.status,
        locationId: reports.locationId,
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
        scanId: reportRecords.scanId,
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

    const bottleIds = [
      ...new Set(
        input.records
          .map((record) => record.bottleId)
          .filter((id): id is string => typeof id === 'string')
      ),
    ];
    const resolvedBottles =
      bottleIds.length > 0
        ? await tx
            .select({
              id: bottles.id,
              name: bottles.name,
              category: bottles.category,
              upc: bottles.upc,
              sizeMl: bottles.sizeMl,
            })
            .from(bottles)
            .where(inArray(bottles.id, bottleIds))
        : [];

    const bottleMap = new Map(
      resolvedBottles.map((bottle) => [bottle.id, bottle])
    );
    const now = new Date();

    for (const existing of existingRecords) {
      const reviewed = recordMap.get(existing.id);
      if (!reviewed) {
        continue;
      }

      const bottle = reviewed.bottleId
        ? bottleMap.get(reviewed.bottleId)
        : reviewed.bottle
          ? await findOrCreateBottle(reviewed.bottle, tx)
          : undefined;
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

      // Upsert the current state of this bottle at the report's location.
      // Skipped when the report has no locationId (older/adhoc reports); the
      // cellar view is keyed on location so we have nowhere to put it.
      if (report.locationId) {
        await tx
          .insert(inventory)
          .values({
            locationId: report.locationId,
            bottleId: bottle.id,
            fillLevelTenths: reviewed.fillTenths,
            lastScanId: existing.scanId,
            lastScannedAt: now,
          })
          .onConflictDoUpdate({
            target: [inventory.locationId, inventory.bottleId],
            set: {
              fillLevelTenths: reviewed.fillTenths,
              lastScanId: existing.scanId,
              lastScannedAt: now,
            },
          });
      }
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
