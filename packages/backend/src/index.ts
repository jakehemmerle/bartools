import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { streamSSE } from 'hono/streaming';
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
import { resolveUploadPathFromUrl } from './uploads';
import { enqueueReportInference } from './queue';

const app = new Hono();

function jsonError(status: 400 | 404 | 409 | 500, message: string) {
  return new HTTPException(status, {
    message,
  });
}

function collectFiles(body: Record<string, unknown>): File[] {
  const files: File[] = [];

  for (const value of Object.values(body)) {
    if (value instanceof File) {
      files.push(value);
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item instanceof File) {
          files.push(item);
        }
      }
    }
  }

  return files;
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

app.get('/uploads/:filename', async (c) => {
  const filename = basename(c.req.param('filename'));
  const filePath = resolveUploadPathFromUrl(`/uploads/${filename}`);

  try {
    const bytes = await readFile(filePath);
    const extension = filename.split('.').pop()?.toLowerCase();
    const contentType =
      extension === 'png'
        ? 'image/png'
        : extension === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

    return new Response(bytes, {
      headers: {
        'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    throw jsonError(404, 'upload_not_found');
  }
});

app.post('/reports', async (c) => {
  const input = createReportSchema.safeParse(await c.req.json());
  if (!input.success) {
    throw jsonError(400, 'invalid_report_payload');
  }

  const report = await createReport(input.data);
  return c.json(report, 201);
});

app.post('/reports/:reportId/photos', async (c) => {
  const reportId = c.req.param('reportId');
  const body = await c.req.parseBody({ all: true });
  const files = collectFiles(body);

  if (files.length === 0) {
    throw jsonError(400, 'no_files_uploaded');
  }

  try {
    const created = await addReportPhotos(reportId, files);
    return c.json({
      reportId,
      photos: created.map((scan) => ({
        id: scan.id,
        photoUrl: scan.photoUrl,
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

export default {
  port: 3000,
  fetch: app.fetch,
};
