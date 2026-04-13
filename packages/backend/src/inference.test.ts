import { mock } from 'bun:test';

// Mock must be set up before any import that loads @bartools/inference
mock.module('@bartools/inference', () => ({
  DEFAULT_MODEL: 'claude-sonnet-4-6',
  PROMPT_NAME: 'verbena-simple-eval',
  runBottleInference: async () => ({ name: 'Hakushu 12Y', volume: 0.7 }),
  pullPromptTemplate: async () => ({ invoke: async () => ({}) }),
  renderPromptTemplate: async () => ({
    systemPrompt: 'test-system-prompt',
    userPrompt: 'test-user-prompt',
  }),
  client: {
    pullPromptCommit: async () => ({ commit_hash: 'test-hash' }),
  },
}));

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { eq } from 'drizzle-orm';
import { db, pool } from './db';
import { processQueuedInferenceJob } from './inference';
import {
  bottles,
  inferenceAttempts,
  inferenceJobs,
  reportRecords,
  reports,
  scans,
} from './schema';
import {
  cleanup,
  copyTestPhoto,
  seedBottleCatalog,
  seedTestScenario,
  type TestIds,
} from './test-helpers';

let testIds: TestIds;
let bottleIds: string[] = [];

describe('processQueuedInferenceJob', () => {
  beforeAll(async () => {
    const inserted = await seedBottleCatalog();
    bottleIds = inserted.map((b) => b.id);

    const photo = await copyTestPhoto('test-report', 'IMG_3982.jpg');
    testIds = await seedTestScenario({
      photoUrl: photo.photoUrl,
      diskPath: photo.diskPath,
    });
  });

  afterAll(async () => {
    if (testIds) {
      await cleanup({ ids: testIds, bottleIds });
    }
    await pool.end();
  });

  test('processes a single photo and promotes report to unreviewed', async () => {
    await processQueuedInferenceJob({
      jobId: testIds.jobId,
      reportId: testIds.reportId,
      scanId: testIds.scanId,
    });

    // inferenceAttempts: 1 row created with correct metadata
    const [attempt] = await db
      .select()
      .from(inferenceAttempts)
      .where(eq(inferenceAttempts.jobId, testIds.jobId));

    expect(attempt).toBeDefined();
    expect(attempt.attemptNumber).toBe(1);
    expect(attempt.latencyMs).toBeGreaterThanOrEqual(0);
    expect(attempt.rawResponse).toEqual({ name: 'Hakushu 12Y', volume: 0.7 });
    expect(attempt.errorCode).toBeNull();
    expect(attempt.errorMessage).toBeNull();
    expect(attempt.finishedAt).not.toBeNull();
    expect(attempt.modelUsed).toBe('claude-sonnet-4-6');
    expect(attempt.promptName).toBe('verbena-simple-eval');
    expect(attempt.promptResolvedVersion).toBe('test-hash');

    // scans: bottleId and fill level set
    const [scan] = await db
      .select()
      .from(scans)
      .where(eq(scans.id, testIds.scanId));

    expect(scan.bottleId).not.toBeNull();
    expect(scan.vlmFillTenths).toBe(7);
    expect(scan.modelUsed).toBe('claude-sonnet-4-6');
    expect(scan.latencyMs).toBeGreaterThanOrEqual(0);

    // Verify the matched bottle is actually Hakushu 12Y
    const [matchedBottle] = await db
      .select()
      .from(bottles)
      .where(eq(bottles.id, scan.bottleId!));
    expect(matchedBottle.name).toBe('Hakushu 12Y');

    // reportRecords: status inferred with original_* fields
    const [record] = await db
      .select()
      .from(reportRecords)
      .where(eq(reportRecords.scanId, testIds.scanId));

    expect(record.status).toBe('inferred');
    expect(record.originalBottleId).toBe(scan.bottleId);
    expect(record.originalBottleName).toBe('Hakushu 12Y');
    expect(record.originalCategory).toBe('whiskey');
    expect(record.originalVolumeMl).toBe(750);
    expect(record.originalFillTenths).toBe(7);
    expect(record.inferredAt).not.toBeNull();
    expect(record.errorCode).toBeNull();

    // inferenceJobs: succeeded
    const [job] = await db
      .select()
      .from(inferenceJobs)
      .where(eq(inferenceJobs.id, testIds.jobId));

    expect(job.status).toBe('succeeded');
    expect(job.finishedAt).not.toBeNull();
    expect(job.lastErrorCode).toBeNull();
    expect(job.lastErrorMessage).toBeNull();

    // reports: auto-promoted to unreviewed by syncReportProgress
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, testIds.reportId));

    expect(report.status).toBe('unreviewed');
    expect(report.photoCount).toBe(1);
    expect(report.processedCount).toBe(1);
  });
});
