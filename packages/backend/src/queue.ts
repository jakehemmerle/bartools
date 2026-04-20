import { enqueue } from 'motia';
import {
  processQueuedInferenceJob,
  reportScanInferencePayloadSchema,
  reportScanInferenceTopic,
} from './inference';
import { enqueueCloudTask } from './cloud-tasks';

// Motia's enqueue() connects to an engine at III_URL (defaults to
// ws://localhost:49134 in dev). When the URL isn't set (e.g. on Cloud Run),
// the connection hangs instead of failing, which times out the HTTP request.
// Gate the motia path on III_URL being set; otherwise process inline.
const USE_MOTIA = Boolean(process.env.III_URL);

export async function enqueueReportInference(input: {
  jobId: string;
  reportId: string;
  scanId: string;
}, opts: { targetUrl?: string } = {}) {
  const payload = reportScanInferencePayloadSchema.parse(input);
  let cloudTaskFailed = false;

  if (opts.targetUrl) {
    try {
      const cloudTask = await enqueueCloudTask(payload, { targetUrl: opts.targetUrl });
      if (cloudTask) {
        return cloudTask;
      }
    } catch (error) {
      console.error('Cloud Tasks enqueue failed; falling back to local inference queue', {
        jobId: payload.jobId,
        reportId: payload.reportId,
        scanId: payload.scanId,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      cloudTaskFailed = true;
    }
  }

  if (USE_MOTIA) {
    try {
      await enqueue({
        topic: reportScanInferenceTopic,
        data: payload,
        messageGroupId: payload.reportId,
      });
      return { mode: cloudTaskFailed ? 'motia_fallback' : 'motia' as const };
    } catch {
      // fall through to local
    }
  }

  queueMicrotask(() => {
    void processQueuedInferenceJob(payload).catch((error) => {
      console.error('Unhandled local inference queue failure', {
        jobId: payload.jobId,
        reportId: payload.reportId,
        scanId: payload.scanId,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    });
  });
  return { mode: cloudTaskFailed ? 'local_fallback' : 'local' as const };
}
