import { enqueue } from 'motia';
import {
  processQueuedInferenceJob,
  reportScanInferencePayloadSchema,
  reportScanInferenceTopic,
} from './inference';

// Motia's enqueue() connects to an engine at III_URL (defaults to
// ws://localhost:49134 in dev). When the URL isn't set (e.g. on Cloud Run),
// the connection hangs instead of failing, which times out the HTTP request.
// Gate the motia path on III_URL being set; otherwise process inline.
const USE_MOTIA = Boolean(process.env.III_URL);

export async function enqueueReportInference(input: {
  jobId: string;
  reportId: string;
  scanId: string;
}) {
  const payload = reportScanInferencePayloadSchema.parse(input);

  if (USE_MOTIA) {
    try {
      await enqueue({
        topic: reportScanInferenceTopic,
        data: payload,
        messageGroupId: payload.reportId,
      });
      return { mode: 'motia' as const };
    } catch {
      // fall through to local
    }
  }

  queueMicrotask(() => {
    void processQueuedInferenceJob(payload);
  });
  return { mode: 'local' as const };
}

