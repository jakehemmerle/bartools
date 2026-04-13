import { and, count, eq } from 'drizzle-orm';
import {
  createSdkMcpServer,
  query,
  tool,
  type SDKUserMessage,
} from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { validateAnswer } from '../../eval/src/ask-model';
import { client as langsmithClient } from '../../eval/src/client';
import {
  PROMPT_NAME,
  pullPromptTemplate,
  renderPromptTemplate,
} from '../../eval/src/prompt';
import { DEFAULT_MODEL, MAX_ATTEMPTS } from '../../eval/src/types';
import { db } from './db';
import { syncReportProgress } from './report-service';
import {
  bottles,
  inferenceAttempts,
  inferenceJobs,
  reportRecords,
  scans,
} from './schema';
import { resolveUploadPathFromUrl } from './uploads';

export const reportScanInferenceTopic = 'report.scan.inference';

export const reportScanInferencePayloadSchema = z.object({
  jobId: z.string().uuid(),
  reportId: z.string().uuid(),
  scanId: z.string().uuid(),
});

type PromptCache = {
  promptName: string;
  version: string;
  prompt: Awaited<ReturnType<typeof pullPromptTemplate>>;
  cachedAt: number;
};

let promptCache: PromptCache | null = null;
const promptCacheTtlMs = 30_000;

async function* asyncIter<T>(items: T[]): AsyncIterable<T> {
  for (const item of items) {
    yield item;
  }
}

async function runVisionInference(input: {
  imageBytes: Uint8Array;
  bottleNames: string[];
  systemPrompt: string;
  userPrompt: string;
}): Promise<{ name: string; volume: number; error?: string }> {
  const base64 = Buffer.from(input.imageBytes).toString('base64');
  let attempts = 0;
  let answer: { name: string; volume: number } | null = null;
  const triedInvalid: string[] = [];
  const validNames = new Set(input.bottleNames);

  const submitAnswer = tool(
    'submit_answer',
    'Submit your final bottle identification and fill-level estimate.',
    {
      name: z
        .string()
        .describe('Bottle name, copied verbatim from the provided list.'),
      volume: z
        .number()
        .describe('Fill level from 0.0 to 1.0 in 0.1 increments.'),
    },
    async (args) => {
      attempts += 1;
      const result = validateAnswer(args.name, args.volume, validNames);

      if (result.ok) {
        answer = {
          name: args.name,
          volume: result.volume,
        };
        return {
          content: [
            { type: 'text', text: 'Answer recorded. End the conversation.' },
          ],
        };
      }

      if (result.reason === 'invalid_name') {
        triedInvalid.push(args.name);
        if (attempts >= MAX_ATTEMPTS) {
          return {
            content: [
              { type: 'text', text: 'MAX_ATTEMPTS_EXCEEDED. Stop now.' },
            ],
            isError: true,
          };
        }
        return {
          content: [
            {
              type: 'text',
              text: `"${args.name}" is not in the valid bottle list. Pick a different name verbatim from the list.`,
            },
          ],
          isError: true,
        };
      }

      if (attempts >= MAX_ATTEMPTS) {
        return {
          content: [{ type: 'text', text: 'MAX_ATTEMPTS_EXCEEDED. Stop now.' }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `volume=${args.volume} is invalid. Use one of 0, 0.1, ..., 1.0.`,
          },
        ],
        isError: true,
      };
    }
  );

  const mcpServer = createSdkMcpServer({
    name: 'eval',
    version: '0.1.0',
    tools: [submitAnswer],
  });

  const userMessage: SDKUserMessage = {
    type: 'user',
    parent_tool_use_id: null,
    message: {
      role: 'user',
      content: [
        { type: 'text', text: input.userPrompt },
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: base64,
          },
        },
      ],
    },
  };

  const q = query({
    prompt: asyncIter([userMessage]),
    options: {
      systemPrompt: input.systemPrompt,
      model: DEFAULT_MODEL,
      tools: [],
      mcpServers: { eval: mcpServer },
      allowedTools: ['mcp__eval__submit_answer'],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      persistSession: false,
    },
  });

  for await (const event of q) {
    void event;
    // drain the SDK event stream
  }

  if (answer) {
    return answer;
  }

  return {
    name: '',
    volume: 0,
    error: `agent never produced a valid answer; tried [${triedInvalid.join(', ')}]`,
  };
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

function now() {
  return new Date();
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
      finishedAt: now(),
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
  const finishedAt = now();

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

export async function processQueuedInferenceJob(
  payloadInput: z.input<typeof reportScanInferencePayloadSchema>
) {
  const payload = reportScanInferencePayloadSchema.parse(payloadInput);

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

  const startedAt = now();
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
      photoUrl: scans.photoUrl,
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

  const bottleNames = catalog.map((bottle) => bottle.name);
  const filePath = resolveUploadPathFromUrl(scan.photoUrl);
  const imageFile = Bun.file(filePath);

  if (!(await imageFile.exists())) {
    await markAttemptFailure({
      attemptId: attempt.id,
      errorCode: 'photo_missing',
      errorMessage: `Uploaded file is missing at ${scan.photoUrl}.`,
    });
    await failJob({
      jobId: payload.jobId,
      reportId: payload.reportId,
      scanId: payload.scanId,
      errorCode: 'photo_missing',
      errorMessage: `Uploaded file is missing at ${scan.photoUrl}.`,
    });
    return;
  }

  const imageBytes = new Uint8Array(await imageFile.arrayBuffer());
  const rendered = await renderPromptTemplate(prompt.prompt, bottleNames);
  const inferenceStartedAt = Date.now();
  const result = await runVisionInference({
    imageBytes,
    bottleNames,
    systemPrompt: rendered.systemPrompt,
    userPrompt: rendered.userPrompt,
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
        finishedAt: now(),
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
        finishedAt: now(),
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

  const finishedAt = now();
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
