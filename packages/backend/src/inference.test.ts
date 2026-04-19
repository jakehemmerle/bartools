import { mock } from 'bun:test';

// Set TESTING_E2E_CALLS_REAL_VLM_API=true to hit the real Claude/LangSmith
// stack instead of the in-test mock. Requires CLAUDE_CODE_OAUTH_TOKEN (or
// ANTHROPIC_API_KEY) and LANGSMITH_API_KEY to be set in the environment.
const LIVE = process.env.TESTING_E2E_CALLS_REAL_VLM_API === 'true';

// Mock must be set up before any import that loads @bartools/inference.
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

import { describe, test, expect, beforeAll, beforeEach } from 'bun:test';
import { copyFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { eq } from 'drizzle-orm';
import { db } from './db';
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
  buildTestGcsObject,
  seedTestScenario,
  type TestIds,
} from './test-fixtures';
import { seedBottles } from './seed';

const ASSETS_PHOTOS = resolve(import.meta.dir, '../../../assets/photos');
const UPLOAD_DIR = resolve(import.meta.dir, '../data/uploads');

describe('processQueuedInferenceJob', () => {
  let testIds: TestIds;

  beforeAll(async () => {
    await mkdir(UPLOAD_DIR, { recursive: true });
  });

  beforeEach(async () => {
    // test-setup truncates everything except bottles; reseed the catalog.
    await seedBottles();

    const reportId = crypto.randomUUID();
    const { bucket, object } = buildTestGcsObject(reportId, 'IMG_3982.jpg');

    // test-setup's storage mock reads `data/uploads/{object}` from disk.
    await mkdir(resolve(UPLOAD_DIR, object, '..'), { recursive: true });
    await copyFile(resolve(ASSETS_PHOTOS, 'IMG_3982.jpg'), resolve(UPLOAD_DIR, object));

    testIds = await seedTestScenario({ bucket, object });
  });

  test('processes a single photo and promotes report to unreviewed', async () => {
    await processQueuedInferenceJob({
      jobId: testIds.jobId,
      reportId: testIds.reportId,
      scanId: testIds.scanId,
    });

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

    const [job] = await db
      .select()
      .from(inferenceJobs)
      .where(eq(inferenceJobs.id, testIds.jobId));

    expect(job.status).toBe('succeeded');
    expect(job.finishedAt).not.toBeNull();
    expect(job.lastErrorCode).toBeNull();
    expect(job.lastErrorMessage).toBeNull();

    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, testIds.reportId));

    expect(report.status).toBe('unreviewed');
    expect(report.photoCount).toBe(1);
    expect(report.processedCount).toBe(1);
  }, LIVE ? 180_000 : 10_000);
});
