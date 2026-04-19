import { Hono } from 'hono';
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
import { enqueueReportInference } from './queue';
import { getBucketName, getTtlSeconds, presignPut } from './storage';

const app = new Hono();

function jsonError(status: 400 | 404 | 409 | 500, message: string) {
  return new HTTPException(status, {
    message,
  });
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

  try {
    const jobs = await submitReport(reportId);
    const enqueueResults = await Promise.all(
      jobs.map((job) => enqueueReportInference(job))
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
  const initial = await getReportStreamState(reportId);
  if (!initial) {
    throw jsonError(404, 'report_not_found');
  }

  return streamSSE(c, async (stream) => {
    const seen = new Map<string, string>();
    let lastReportStatus = '';

    stream.onAbort(() => {
      seen.clear();
    });

    while (true) {
      const state = await getReportStreamState(reportId);
      if (!state) {
        await stream.writeSSE({
          event: 'report.error',
          data: JSON.stringify({ reportId, error: 'report_not_found' }),
        });
        break;
      }

      const reportSignature = `${state.report.status}:${state.report.processedCount}:${state.report.photoCount}`;
      if (reportSignature !== lastReportStatus) {
        await stream.writeSSE({
          event: 'report.progress',
          data: JSON.stringify(state.report),
        });
        lastReportStatus = reportSignature;
      }

      for (const record of state.records) {
        const signature = JSON.stringify({
          status: record.status,
          bottleName: record.bottleName,
          fillPercent: record.fillPercent,
          errorCode: record.errorCode,
        });
        if (seen.get(record.id) === signature) {
          continue;
        }

        await stream.writeSSE({
          event:
            record.status === 'failed'
              ? 'record.failed'
              : record.status === 'reviewed'
                ? 'record.reviewed'
                : 'record.inferred',
          data: JSON.stringify(record),
        });
        seen.set(record.id, signature);
      }

      if (state.report.status === 'unreviewed' || state.report.status === 'reviewed') {
        await stream.writeSSE({
          event: 'report.ready_for_review',
          data: JSON.stringify(state.report),
        });
        break;
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

app.get('/locations/:locationId/inventory', async (c) => {
  const items = await listInventoryForLocation(c.req.param('locationId'));
  return c.json({ items });
});

const upsertInventorySchema = z.object({
  locationId: z.string().uuid(),
  bottleId: z.string().uuid(),
  fillPercent: z.number().min(0).max(100),
  notes: z.string().optional(),
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
      fillLevelTenths,
      notes: parsed.data.notes,
    });
    return c.json(item, 201);
  } catch (error) {
    if (error instanceof Error) {
      if (['location_not_found', 'bottle_not_found'].includes(error.message)) {
        throw jsonError(404, error.message);
      }
    }
    throw error;
  }
});

export default {
  port: 3000,
  fetch: app.fetch,
};
