import { mock } from 'bun:test';
import { readFile } from 'node:fs/promises';

// Set TESTING_E2E_CALLS_REAL_VLM_API=true to hit the real Claude/LangSmith
// stack instead of the in-test mock. Requires CLAUDE_CODE_OAUTH_TOKEN (or
// ANTHROPIC_API_KEY) and LANGSMITH_API_KEY to be set in the environment.
const LIVE = process.env.TESTING_E2E_CALLS_REAL_VLM_API === 'true';

// Mock must be set up before any import that loads @bartools/inference
if (!LIVE) {
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
}

// Mock GCS storage so inference reads bytes from the local test-uploads dir
// (populated by copyTestPhoto) instead of a live bucket.
mock.module('./storage', async () => {
  const { TEST_BUCKET, diskPathForObject } = await import('./test-helpers');
  return {
    getBucketName: () => TEST_BUCKET,
    getTtlSeconds: () => 300,
    presignPut: async (object: string) => ({
      putUrl: `http://test.invalid/${object}`,
      expiresAt: new Date(Date.now() + 300_000),
    }),
    getObjectBytes: async (object: string): Promise<Uint8Array> => {
      const buf = await readFile(diskPathForObject(object));
      return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
    },
  };
});

import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { eq } from 'drizzle-orm';
import { client as langsmithClient } from '@bartools/inference';
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
      object: photo.object,
      bucket: photo.bucket,
      diskPath: photo.diskPath,
    });
  });

  afterAll(async () => {
    if (testIds) {
      await cleanup({ ids: testIds, bottleIds });
    }
    if (LIVE) {
      // LangSmith batches trace writes; flush before the process exits so the
      // runBottleInference span gets its end event recorded (otherwise traces
      // appear stuck in "running" forever).
      await langsmithClient.awaitPendingTraceBatches();
    }
    await pool.end();
  });

  test('processes a single photo and promotes report to unreviewed', async () => {
    // Real inference may retry up to 4 times in runtime.ts
    // so give it a generous budget when LIVE

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
    expect(attempt.errorCode).toBeNull();
    expect(attempt.errorMessage).toBeNull();
    expect(attempt.finishedAt).not.toBeNull();
    expect(attempt.modelUsed).toBe('claude-sonnet-4-6');
    expect(attempt.promptName).toBe('verbena-simple-eval');

    if (LIVE) {
      // Real model: any valid name/volume pair, real commit hash from LangSmith
      const raw = attempt.rawResponse as { name: string; volume: number };
      expect(typeof raw.name).toBe('string');
      expect(raw.name.length).toBeGreaterThan(0);
      expect(typeof raw.volume).toBe('number');
      expect(raw.volume).toBeGreaterThanOrEqual(0);
      expect(raw.volume).toBeLessThanOrEqual(1);
      expect(typeof attempt.promptResolvedVersion).toBe('string');
      expect(attempt.promptResolvedVersion!.length).toBeGreaterThan(0);
    } else {
      expect(attempt.rawResponse).toEqual({ name: 'Hakushu 12Y', volume: 0.7 });
      expect(attempt.promptResolvedVersion).toBe('test-hash');
    }

    // scans: bottleId and fill level set
    const [scan] = await db
      .select()
      .from(scans)
      .where(eq(scans.id, testIds.scanId));

    expect(scan.bottleId).not.toBeNull();
    expect(scan.modelUsed).toBe('claude-sonnet-4-6');
    expect(scan.latencyMs).toBeGreaterThanOrEqual(0);
    if (LIVE) {
      expect(scan.vlmFillTenths).toBeGreaterThanOrEqual(0);
      expect(scan.vlmFillTenths).toBeLessThanOrEqual(10);
    } else {
      expect(scan.vlmFillTenths).toBe(7);
    }

    // Catalog-matched bottle row
    const [matchedBottle] = await db
      .select()
      .from(bottles)
      .where(eq(bottles.id, scan.bottleId!));
    if (LIVE) {
      const raw = attempt.rawResponse as { name: string };
      expect(matchedBottle.name).toBe(raw.name);
    } else {
      expect(matchedBottle.name).toBe('Hakushu 12Y');
    }

    // reportRecords: status inferred with original_* fields
    const [record] = await db
      .select()
      .from(reportRecords)
      .where(eq(reportRecords.scanId, testIds.scanId));

    expect(record.status).toBe('inferred');
    expect(record.originalBottleId).toBe(scan.bottleId);
    expect(record.inferredAt).not.toBeNull();
    expect(record.errorCode).toBeNull();
    if (LIVE) {
      expect(record.originalBottleName).toBe(matchedBottle.name);
      expect(record.originalCategory).toBe(matchedBottle.category);
      expect(record.originalVolumeMl).toBe(matchedBottle.sizeMl);
      expect(record.originalFillTenths).toBe(scan.vlmFillTenths);
    } else {
      expect(record.originalBottleName).toBe('Hakushu 12Y');
      expect(record.originalCategory).toBe('whiskey');
      expect(record.originalVolumeMl).toBe(750);
      expect(record.originalFillTenths).toBe(7);
    }

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
  }, LIVE ? 180_000 : 10_000);
});
