import { enqueue } from 'motia';
import {
  processQueuedInferenceJob,
  reportScanInferencePayloadSchema,
  reportScanInferenceTopic,
} from './inference';

export async function enqueueReportInference(input: {
  jobId: string;
  reportId: string;
  scanId: string;
}) {
  const payload = reportScanInferencePayloadSchema.parse(input);

  try {
    await enqueue({
      topic: reportScanInferenceTopic,
      data: payload,
      messageGroupId: payload.reportId,
    });
    return { mode: 'motia' as const };
  } catch {
    queueMicrotask(() => {
      void processQueuedInferenceJob(payload);
    });
    return { mode: 'local' as const };
  }
}

