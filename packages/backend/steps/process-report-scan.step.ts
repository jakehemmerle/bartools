import { type Handlers, type StepConfig, queue } from 'motia';
import {
  processQueuedInferenceJob,
  reportScanInferencePayloadSchema,
  reportScanInferenceTopic,
} from '../src/inference';

export const config = {
  name: 'ProcessReportScanInference',
  description: 'Runs one bottle-photo inference job and updates report progress.',
  flows: ['report-inference'],
  triggers: [
    queue(reportScanInferenceTopic, {
      input: reportScanInferencePayloadSchema,
      config: {
        type: 'fifo',
        maxRetries: 3,
        concurrency: 4,
        backoffType: 'exponential',
        backoffDelayMs: 500,
      },
    }),
  ],
} as const satisfies StepConfig;

export const handler: Handlers<typeof config> = async (input, ctx) => {
  const payload = ctx.getData();
  await processQueuedInferenceJob(payload);
};

