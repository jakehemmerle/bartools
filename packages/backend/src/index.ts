import { Hono } from 'hono';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { streamSSE } from 'hono/streaming';
import { z } from 'zod';
import {
  addReportPhotos,
  createReport,
  createReportSchema,
  getReportDetail,
  getReportStreamState,
  listReports,
  listVenueLocations,
  reviewReport,
  reviewReportSchema,
  searchBottles,
  submitReport,
} from './report-service';
import {
  listInventoryForLocation,
  listInventoryForVenue,
  upsertInventoryItem,
} from './inventory-queries';
import { listLowStockAlerts } from './low-stock-queries';
import { manualBottleSchema } from './bottle-queries';
import {
  failStaleInferenceJobs,
  processQueuedInferenceJob,
  reportScanInferencePayloadSchema,
} from './inference';
import { enqueueReportInference } from './queue';
import { getBucketName, getTtlSeconds, presignGet, presignPut } from './storage';
import { verifyCloudTaskRequest } from './task-auth';
import { uuid } from './validators';

const app = new Hono();

function isClientDisconnectError(error: unknown) {
  if (!(error instanceof Error) || !('code' in error || 'errno' in error)) {
    return false;
  }

  const coded = error as { code?: unknown; errno?: unknown };
  return coded.code === 'EPIPE' || coded.code === 'ERR_STREAM_DESTROYED' || coded.errno === -32;
}

process.on('uncaughtException', (error) => {
  if (isClientDisconnectError(error)) {
    console.warn('Ignored client disconnect after stream write', {
      code: (error as { code?: unknown }).code,
      errno: (error as { errno?: unknown }).errno,
    });
    return;
  }

  throw error;
});

function jsonError(status: 400 | 401 | 404 | 409 | 500 | 503, message: string) {
  return new HTTPException(status, {
    message,
  });
}

function forwardedHeaderValue(value: string | undefined) {
  return value?.split(',')[0]?.trim() || null;
}

function externalRequestOrigin(c: Context) {
  const requestUrl = new URL(c.req.url);
  const forwardedProto = forwardedHeaderValue(c.req.header('x-forwarded-proto'));
  const forwardedHost = forwardedHeaderValue(c.req.header('x-forwarded-host'));
  const host = forwardedHost ?? c.req.header('host') ?? requestUrl.host;
  const protocol = forwardedProto ?? requestUrl.protocol.replace(/:$/, '');

  return `${protocol}://${host}`;
}

app.onError((error, c) => {
  if (error instanceof HTTPException) {
    return c.json({ error: error.message }, error.status);
  }

  if (error instanceof Error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ error: 'unknown_error' }, 500);
});

app.get('/', (c) => c.json({ service: 'bartools-backend', ok: true }));
app.get('/health', (c) => c.json({ ok: true }));

app.post('/reports', async (c) => {
  const input = createReportSchema.safeParse(await c.req.json());
  if (!input.success) {
    throw jsonError(400, 'invalid_report_payload');
  }

  const report = await createReport(input.data);
  return c.json(report, 201);
});

// Allowlist of photo MIME types mobile/web clients may upload. Keep in sync
// with EXT_FOR_CONTENT_TYPE below so object keys carry the matching extension.
const ALLOWED_PHOTO_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
] as const;
type PhotoContentType = (typeof ALLOWED_PHOTO_CONTENT_TYPES)[number];

const EXT_FOR_CONTENT_TYPE: Record<PhotoContentType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/webp': 'webp',
};

function buildPhotoObjectKey(reportId: string, contentType: PhotoContentType): string {
  return `reports/${reportId}/${crypto.randomUUID()}.${EXT_FOR_CONTENT_TYPE[contentType]}`;
}

const presignRequestSchema = z.object({
  uploads: z
    .array(
      z.object({
        contentType: z.enum(ALLOWED_PHOTO_CONTENT_TYPES).default('image/jpeg'),
      })
    )
    .min(1)
    .max(50),
});

app.post('/reports/:reportId/photos/presign', async (c) => {
  const reportId = c.req.param('reportId');
  const parsed = presignRequestSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    throw jsonError(400, 'invalid_presign_payload');
  }

  const ttlSeconds = getTtlSeconds();

  const signed = await Promise.all(
    parsed.data.uploads.map(async ({ contentType }) => {
      const object = buildPhotoObjectKey(reportId, contentType);
      const { putUrl, expiresAt } = await presignPut(object, contentType, ttlSeconds);
      return {
        object,
        putUrl,
        contentType,
        expiresAt: expiresAt.toISOString(),
      };
    })
  );

  return c.json({ uploads: signed });
});

const completeUploadSchema = z.object({
  object: z.string().min(1),
  sortOrder: z.number().int().min(0),
});

const completeRequestSchema = z.object({
  uploads: z.array(completeUploadSchema).min(1),
});

app.post('/reports/:reportId/photos/complete', async (c) => {
  const reportId = c.req.param('reportId');
  const parsed = completeRequestSchema.safeParse(await c.req.json());
  if (!parsed.success) {
    throw jsonError(400, 'invalid_complete_payload');
  }

  const expectedPrefix = `reports/${reportId}/`;
  for (const upload of parsed.data.uploads) {
    if (!upload.object.startsWith(expectedPrefix)) {
      throw jsonError(400, 'invalid_object_key');
    }
  }

  try {
    // Ensure bucket is configured before mutating DB.
    getBucketName();
    const created = await addReportPhotos(reportId, parsed.data.uploads);
    return c.json({
      scans: created.map((scan) => ({
        id: scan.id,
        object: scan.photoGcsObject,
        sortOrder: scan.sortOrder,
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'report_not_found') {
      throw jsonError(404, error.message);
    }
    if (error instanceof Error && error.message === 'report_not_editable') {
      throw jsonError(409, error.message);
    }
    throw error;
  }
});

app.post('/reports/:reportId/submit', async (c) => {
  const reportId = c.req.param('reportId');
  const taskTargetUrl = `${externalRequestOrigin(c)}/internal/tasks/report-scan-inference`;

  try {
    const jobs = await submitReport(reportId);
    const enqueueResults = await Promise.all(
      jobs.map((job) => enqueueReportInference(job, { targetUrl: taskTargetUrl }))
    );

    return c.json({
      reportId,
      enqueued: jobs.length,
      queueModes: [...new Set(enqueueResults.map((result) => result.mode))],
    });
  } catch (error) {
    if (
      error instanceof Error &&
      ['report_not_found', 'report_has_no_photos'].includes(error.message)
    ) {
      throw jsonError(404, error.message);
    }
    if (error instanceof Error && error.message === 'report_not_submittable') {
      throw jsonError(409, error.message);
    }
    throw error;
  }
});

app.post('/internal/tasks/report-scan-inference', async (c) => {
  const audience = externalRequestOrigin(c);
  const authorized = await verifyCloudTaskRequest({
    authorization: c.req.header('authorization'),
    audience,
    expectedEmail: process.env.CLOUD_TASKS_OIDC_SERVICE_ACCOUNT_EMAIL,
  });
  if (!authorized) {
    throw jsonError(401, 'unauthorized_task_request');
  }

  const parsed = reportScanInferencePayloadSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    throw jsonError(400, 'invalid_task_payload');
  }

  const result = await processQueuedInferenceJob(parsed.data);
  if (result?.status === 'busy') {
    throw jsonError(503, 'inference_job_already_running');
  }

  return c.body(null, 204);
});

app.get('/reports', async (c) => {
  const reports = await listReports();
  return c.json({ reports });
});

app.get('/reports/:reportId', async (c) => {
  const report = await getReportDetail(c.req.param('reportId'));
  if (!report) {
    throw jsonError(404, 'report_not_found');
  }

  return c.json(report);
});

app.get('/reports/:reportId/stream', async (c) => {
  const reportId = c.req.param('reportId');
  const initial = await getReportStreamState(reportId, async () => '');
  if (!initial) {
    throw jsonError(404, 'report_not_found');
  }

  return streamSSE(c, async (stream) => {
    const seen = new Map<string, string>();
    const imageUrls = new Map<string, { url: string; expiresAtMs: number }>();
    const imageTtlSeconds = getTtlSeconds();
    let lastReportStatus = '';
    let aborted = false;
    let lastStaleSweepAt = 0;
    let lastWriteAt = 0;

    const writeSSE = async (event: {
      event: string;
      data: string;
    }): Promise<boolean> => {
      if (aborted) return false;
      try {
        await stream.writeSSE(event);
        lastWriteAt = Date.now();
        return true;
      } catch (error) {
        if (isClientDisconnectError(error)) {
          aborted = true;
          return false;
        }
        throw error;
      }
    };

    const imageUrlForObject = async (object: string | null) => {
      if (!object) return '';
      const cached = imageUrls.get(object);
      if (cached && cached.expiresAtMs - Date.now() > 30_000) {
        return cached.url;
      }
      const { getUrl, expiresAt } = await presignGet(object, imageTtlSeconds);
      imageUrls.set(object, { url: getUrl, expiresAtMs: expiresAt.getTime() });
      return getUrl;
    };

    stream.onAbort(() => {
      aborted = true;
      seen.clear();
      imageUrls.clear();
    });

    while (true) {
      if (aborted) break;

      if (Date.now() - lastStaleSweepAt > 15_000) {
        await failStaleInferenceJobs({ reportId, limit: 25 });
        lastStaleSweepAt = Date.now();
      }

      const state = await getReportStreamState(reportId, imageUrlForObject);
      if (!state) {
        await writeSSE({
          event: 'report.error',
          data: JSON.stringify({ reportId, error: 'report_not_found' }),
        });
        break;
      }

      const reportSignature = `${state.report.status}:${state.report.processedCount}:${state.report.photoCount}`;
      if (reportSignature !== lastReportStatus) {
        const sent = await writeSSE({
          event: 'report.progress',
          data: JSON.stringify(state.report),
        });
        if (!sent) break;
        lastReportStatus = reportSignature;
      }

      for (const record of state.records) {
        if (record.status === 'pending') {
          continue;
        }

        const signature = JSON.stringify({
          status: record.status,
          bottleName: record.bottleName,
          fillPercent: record.fillPercent,
          errorCode: record.errorCode,
        });
        if (seen.get(record.id) === signature) {
          continue;
        }

        const sent = await writeSSE({
          event:
            record.status === 'failed'
              ? 'record.failed'
              : record.status === 'reviewed'
                ? 'record.reviewed'
                : 'record.inferred',
          data: JSON.stringify(record),
        });
        if (!sent) break;
        seen.set(record.id, signature);
      }
      if (aborted) break;

      if (state.report.status === 'unreviewed' || state.report.status === 'reviewed') {
        await writeSSE({
          event: 'report.ready_for_review',
          data: JSON.stringify(state.report),
        });
        break;
      }

      if (Date.now() - lastWriteAt > 5_000) {
        const sent = await writeSSE({
          event: 'report.heartbeat',
          data: JSON.stringify({ reportId, at: new Date().toISOString() }),
        });
        if (!sent) break;
      }

      await stream.sleep(750);
    }
  });
});

app.post('/reports/:reportId/review', async (c) => {
  const reportId = c.req.param('reportId');
  const input = reviewReportSchema.safeParse(await c.req.json());

  if (!input.success) {
    throw jsonError(400, 'invalid_review_payload');
  }

  try {
    await reviewReport(reportId, input.data);
    const detail = await getReportDetail(reportId);
    return c.json(detail);
  } catch (error) {
    if (error instanceof Error && error.message === 'report_not_found') {
      throw jsonError(404, error.message);
    }
    if (
      error instanceof Error &&
      ['report_not_reviewable', 'report_review_incomplete'].includes(error.message)
    ) {
      throw jsonError(409, error.message);
    }
    if (error instanceof Error && error.message === 'review_bottle_not_found') {
      throw jsonError(400, error.message);
    }
    throw error;
  }
});

app.get('/bottles/search', async (c) => {
  const query = c.req.query('q') ?? '';
  return c.json({
    bottles: await searchBottles(query),
  });
});

app.get('/venues/:venueId/locations', async (c) => {
  const locations = await listVenueLocations(c.req.param('venueId'));
  return c.json({ locations });
});

app.get('/venues/:venueId/inventory', async (c) => {
  const items = await listInventoryForVenue(c.req.param('venueId'));
  return c.json({ items });
});

app.get('/venues/:venueId/low-stock', async (c) => {
  const alerts = await listLowStockAlerts(c.req.param('venueId'));
  return c.json({ alerts });
});

app.get('/locations/:locationId/inventory', async (c) => {
  const items = await listInventoryForLocation(c.req.param('locationId'));
  return c.json({ items });
});

const upsertInventorySchema = z.object({
  locationId: uuid(),
  bottleId: uuid().optional(),
  bottle: manualBottleSchema.optional(),
  fillPercent: z.number().min(0).max(100),
  notes: z.string().optional(),
}).refine((input) => Boolean(input.bottleId) !== Boolean(input.bottle), {
  message: 'Provide exactly one of bottleId or bottle',
});

app.post('/inventory', async (c) => {
  const parsed = upsertInventorySchema.safeParse(await c.req.json());
  if (!parsed.success) {
    throw jsonError(400, 'invalid_inventory_payload');
  }

  // Round to nearest tenth, then clamp — upsertInventoryItem also clamps so
  // this is defense in depth for future schema drift.
  const fillLevelTenths = Math.max(
    0,
    Math.min(10, Math.round(parsed.data.fillPercent / 10))
  );

  try {
    const item = await upsertInventoryItem({
      locationId: parsed.data.locationId,
      bottleId: parsed.data.bottleId,
      bottle: parsed.data.bottle,
      fillLevelTenths,
      notes: parsed.data.notes,
    });
    return c.json(item, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (['location_not_found', 'bottle_not_found'].includes(error.message)) {
        throw jsonError(404, error.message);
      }
      if (error.message === 'bottle_required') {
        throw jsonError(400, error.message);
      }
    }
    throw error;
  }
});

export default {
  port: 3000,
  fetch: app.fetch,
};
