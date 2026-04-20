import { and, count, eq, inArray, isNull, lt, or } from 'drizzle-orm';
import {
  client as langsmithClient,
  DEFAULT_MODEL,
  PROMPT_NAME,
  pullPromptTemplate,
  renderPromptTemplate,
  runBottleInference,
} from '@bartools/inference';
import { z } from 'zod';
import { db } from './db';
import { syncReportProgress } from './report-service';
import {
  bottles,
  inferenceAttempts,
  inferenceJobs,
  reportRecords,
  scans,
} from './schema';
import { getObjectBytes } from './storage';
import { uuid } from './validators';

export const reportScanInferenceTopic = 'report.scan.inference';

export const reportScanInferencePayloadSchema = z.object({
  jobId: uuid(),
  reportId: uuid(),
  scanId: uuid(),
});

type PromptCache = {
  promptName: string;
  version: string;
  prompt: Awaited<ReturnType<typeof pullPromptTemplate>>;
  cachedAt: number;
};

let promptCache: PromptCache | null = null;
const promptCacheTtlMs = 30_000;
const DEFAULT_STALE_INFERENCE_JOB_MS = 10 * 60_000;

function getStaleInferenceJobMs(): number {
  const raw = process.env.INFERENCE_JOB_STALE_AFTER_MS;
  if (!raw) return DEFAULT_STALE_INFERENCE_JOB_MS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_STALE_INFERENCE_JOB_MS;
}

async function resolvePrompt() {
  const promptName = process.env.BACKEND_LANGSMITH_PROMPT_NAME ?? PROMPT_NAME;
  const now = Date.now();
  if (
    promptCache &&
    promptCache.promptName === promptName &&
    now - promptCache.cachedAt < promptCacheTtlMs
  ) {
    return promptCache;
  }

  const [prompt, commit] = await Promise.all([
    pullPromptTemplate({
      promptName,
      skipCache: true,
    }),
    langsmithClient.pullPromptCommit(promptName, { skipCache: true }),
  ]);

  promptCache = {
    promptName,
    version: commit.commit_hash,
    prompt,
    cachedAt: now,
  };

  return promptCache;
}

async function markAttemptFailure(args: {
  attemptId: string;
  errorCode: string;
  errorMessage: string;
}) {
  await db
    .update(inferenceAttempts)
    .set({
      errorCode: args.errorCode,
      errorMessage: args.errorMessage,
      finishedAt: new Date(),
    })
    .where(eq(inferenceAttempts.id, args.attemptId));
}

async function failJob(args: {
  jobId: string;
  reportId: string;
  scanId: string;
  errorCode: string;
  errorMessage: string;
}) {
  const finishedAt = new Date();

  await db.transaction(async (tx) => {
    await tx
      .update(inferenceJobs)
      .set({
        status: 'failed',
        lastErrorCode: args.errorCode,
        lastErrorMessage: args.errorMessage,
        finishedAt,
        updatedAt: finishedAt,
      })
      .where(eq(inferenceJobs.id, args.jobId));

    await tx
      .update(reportRecords)
      .set({
        status: 'failed',
        errorCode: args.errorCode,
        errorMessage: args.errorMessage,
        updatedAt: finishedAt,
      })
      .where(eq(reportRecords.scanId, args.scanId));
  });

  await syncReportProgress(args.reportId);
}

export async function failStaleInferenceJobs(opts: {
  reportId?: string;
  now?: Date;
  staleAfterMs?: number;
  limit?: number;
} = {}) {
  const now = opts.now ?? new Date();
  const staleAfterMs = opts.staleAfterMs ?? getStaleInferenceJobMs();
  const cutoff = new Date(now.getTime() - staleAfterMs);
  const limit = opts.limit ?? 10;

  const staleJobs = await db
    .select({
      id: inferenceJobs.id,
      reportId: inferenceJobs.reportId,
      scanId: inferenceJobs.scanId,
      status: inferenceJobs.status,
    })
    .from(inferenceJobs)
    .where(
      and(
        opts.reportId ? eq(inferenceJobs.reportId, opts.reportId) : undefined,
        or(
          and(eq(inferenceJobs.status, 'running'), lt(inferenceJobs.startedAt, cutoff)),
          and(eq(inferenceJobs.status, 'queued'), lt(inferenceJobs.queuedAt, cutoff))
        )
      )
    )
    .limit(limit);

  const failed: Array<{ jobId: string; reportId: string; scanId: string }> = [];

  for (const job of staleJobs) {
    const errorMessage = `Inference job timed out after ${staleAfterMs}ms without completing.`;
    const failedAt = now;

    const transitioned = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(inferenceJobs)
        .set({
          status: 'failed',
          lastErrorCode: 'worker_timeout',
          lastErrorMessage: errorMessage,
          finishedAt: failedAt,
          updatedAt: failedAt,
        })
        .where(and(eq(inferenceJobs.id, job.id), inArray(inferenceJobs.status, ['queued', 'running'])))
        .returning({ id: inferenceJobs.id });

      if (!updated) {
        return false;
      }

      await tx
        .update(inferenceAttempts)
        .set({
          errorCode: 'worker_timeout',
          errorMessage,
          finishedAt: failedAt,
        })
        .where(and(eq(inferenceAttempts.jobId, job.id), isNull(inferenceAttempts.finishedAt)));

      await tx
        .update(reportRecords)
        .set({
          status: 'failed',
          errorCode: 'worker_timeout',
          errorMessage,
          updatedAt: failedAt,
        })
        .where(eq(reportRecords.scanId, job.scanId));

      return true;
    });

    if (transitioned) {
      failed.push({ jobId: job.id, reportId: job.reportId, scanId: job.scanId });
      await syncReportProgress(job.reportId);
    }
  }

  return failed;
}

export async function processQueuedInferenceJob(
  payloadInput: z.input<typeof reportScanInferencePayloadSchema>
) {
  const payload = reportScanInferencePayloadSchema.parse(payloadInput);

  try {
    await processQueuedInferenceJobUnchecked(payload);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Unhandled report inference failure', {
      jobId: payload.jobId,
      reportId: payload.reportId,
      scanId: payload.scanId,
      errorMessage,
    });

    try {
      await failJob({
        jobId: payload.jobId,
        reportId: payload.reportId,
        scanId: payload.scanId,
        errorCode: 'worker_error',
        errorMessage,
      });
    } catch (failError) {
      console.error('Failed to persist report inference failure', {
        jobId: payload.jobId,
        reportId: payload.reportId,
        scanId: payload.scanId,
        errorMessage: failError instanceof Error ? failError.message : String(failError),
      });
    }
  }
}

async function processQueuedInferenceJobUnchecked(
  payload: z.infer<typeof reportScanInferencePayloadSchema>
) {
  const [job] = await db
    .select({
      id: inferenceJobs.id,
      status: inferenceJobs.status,
      reportId: inferenceJobs.reportId,
      scanId: inferenceJobs.scanId,
    })
    .from(inferenceJobs)
    .where(eq(inferenceJobs.id, payload.jobId))
    .limit(1);

  if (!job || (job.status !== 'queued' && job.status !== 'running')) {
    return;
  }

  const startedAt = new Date();
  await db
    .update(inferenceJobs)
    .set({
      status: 'running',
      startedAt,
      updatedAt: startedAt,
    })
    .where(eq(inferenceJobs.id, payload.jobId));

  const [attemptCountRow] = await db
    .select({ count: count(inferenceAttempts.id) })
    .from(inferenceAttempts)
    .where(eq(inferenceAttempts.jobId, payload.jobId));

  const attemptNumber = Number(attemptCountRow?.count ?? 0) + 1;
  const prompt = await resolvePrompt();

  const [attempt] = await db
    .insert(inferenceAttempts)
    .values({
      jobId: payload.jobId,
      attemptNumber,
      promptName: prompt.promptName,
      promptResolvedVersion: prompt.version,
      modelUsed: DEFAULT_MODEL,
    })
    .returning({ id: inferenceAttempts.id });

  const [scan] = await db
    .select({
      id: scans.id,
      photoGcsBucket: scans.photoGcsBucket,
      photoGcsObject: scans.photoGcsObject,
      reportId: scans.reportId,
    })
    .from(scans)
    .where(and(eq(scans.id, payload.scanId), eq(scans.reportId, payload.reportId)))
    .limit(1);

  if (!scan) {
    await markAttemptFailure({
      attemptId: attempt.id,
      errorCode: 'scan_not_found',
      errorMessage: 'Scan could not be found for this job.',
    });
    await failJob({
      jobId: payload.jobId,
      reportId: payload.reportId,
      scanId: payload.scanId,
      errorCode: 'scan_not_found',
      errorMessage: 'Scan could not be found for this job.',
    });
    return;
  }

  const catalog = await db
    .select({
      id: bottles.id,
      name: bottles.name,
      category: bottles.category,
      upc: bottles.upc,
      sizeMl: bottles.sizeMl,
    })
    .from(bottles)
    .orderBy(bottles.name);

  if (catalog.length === 0) {
    await markAttemptFailure({
      attemptId: attempt.id,
      errorCode: 'catalog_empty',
      errorMessage: 'Bottle catalog is empty.',
    });
    await failJob({
      jobId: payload.jobId,
      reportId: payload.reportId,
      scanId: payload.scanId,
      errorCode: 'catalog_empty',
      errorMessage: 'Bottle catalog is empty.',
    });
    return;
  }

  let imageBytes: Uint8Array;
  try {
    imageBytes = await getObjectBytes(scan.photoGcsObject);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorMessage = `Uploaded object gs://${scan.photoGcsBucket}/${scan.photoGcsObject} is unreadable: ${message}`;
    await markAttemptFailure({
      attemptId: attempt.id,
      errorCode: 'photo_missing',
      errorMessage,
    });
    await failJob({
      jobId: payload.jobId,
      reportId: payload.reportId,
      scanId: payload.scanId,
      errorCode: 'photo_missing',
      errorMessage,
    });
    return;
  }

  const possibleBottleNames = catalog.map((b) => b.name);
  const rendered = await renderPromptTemplate(prompt.prompt, {
    possible_bottle_names_text: possibleBottleNames.join('\n'),
    bottle_count: possibleBottleNames.length,
  });
  const inferenceStartedAt = Date.now();
  const result = await runBottleInference({
    imageBytes,
    systemPrompt: rendered.systemPrompt,
    userPrompt: rendered.userPrompt,
    validNames: possibleBottleNames,
  });
  const latencyMs = Date.now() - inferenceStartedAt;

  if (result.error) {
    await db
      .update(inferenceAttempts)
      .set({
        latencyMs,
        rawResponse: {
          error: result.error,
        },
        errorCode: 'model_error',
        errorMessage: result.error,
        finishedAt: new Date(),
      })
      .where(eq(inferenceAttempts.id, attempt.id));

    await failJob({
      jobId: payload.jobId,
      reportId: payload.reportId,
      scanId: payload.scanId,
      errorCode: 'model_error',
      errorMessage: result.error,
    });
    return;
  }

  const matchedBottle = catalog.find((bottle) => bottle.name === result.name);

  if (!matchedBottle) {
    const errorMessage = `Model returned ${result.name}, which is not present in the catalog snapshot.`;
    await db
      .update(inferenceAttempts)
      .set({
        latencyMs,
        rawResponse: {
          name: result.name,
          volume: result.volume,
        },
        errorCode: 'catalog_miss',
        errorMessage,
        finishedAt: new Date(),
      })
      .where(eq(inferenceAttempts.id, attempt.id));

    await failJob({
      jobId: payload.jobId,
      reportId: payload.reportId,
      scanId: payload.scanId,
      errorCode: 'catalog_miss',
      errorMessage,
    });
    return;
  }

  const finishedAt = new Date();
  const fillTenths = Math.round(result.volume * 10);

  await db.transaction(async (tx) => {
    await tx
      .update(inferenceAttempts)
      .set({
        latencyMs,
        rawResponse: {
          name: result.name,
          volume: result.volume,
        },
        finishedAt,
      })
      .where(eq(inferenceAttempts.id, attempt.id));

    await tx
      .update(scans)
      .set({
        bottleId: matchedBottle.id,
        vlmFillTenths: fillTenths,
        modelUsed: DEFAULT_MODEL,
        latencyMs,
        rawResponse: {
          name: result.name,
          volume: result.volume,
          promptVersion: prompt.version,
        },
      })
      .where(eq(scans.id, scan.id));

    await tx
      .update(reportRecords)
      .set({
        status: 'inferred',
        originalBottleId: matchedBottle.id,
        originalBottleName: matchedBottle.name,
        originalCategory: matchedBottle.category,
        originalUpc: matchedBottle.upc,
        originalVolumeMl: matchedBottle.sizeMl,
        originalFillTenths: fillTenths,
        inferredAt: finishedAt,
        updatedAt: finishedAt,
        errorCode: null,
        errorMessage: null,
      })
      .where(eq(reportRecords.scanId, scan.id));

    await tx
      .update(inferenceJobs)
      .set({
        status: 'succeeded',
        finishedAt,
        lastErrorCode: null,
        lastErrorMessage: null,
        updatedAt: finishedAt,
      })
      .where(eq(inferenceJobs.id, payload.jobId));
  });

  await syncReportProgress(payload.reportId);
}
