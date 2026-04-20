import { CloudTasksClient } from '@google-cloud/tasks';
import { z } from 'zod';
import { reportScanInferencePayloadSchema } from './inference';

const TASK_PREFIX = 'report-scan-';
const ALREADY_EXISTS_CODE = 6;

type ReportScanInferencePayload = z.infer<typeof reportScanInferencePayloadSchema>;

export type CloudTasksConfig = {
  projectId: string;
  location: string;
  queueId: string;
  oidcServiceAccountEmail: string;
};

let client: CloudTasksClient | null = null;

function requiredEnv(name: string, env: NodeJS.ProcessEnv): string | null {
  const value = env[name];
  return value && value.trim().length > 0 ? value : null;
}

export function getCloudTasksConfig(env: NodeJS.ProcessEnv = process.env): CloudTasksConfig | null {
  const projectId = requiredEnv('CLOUD_TASKS_PROJECT_ID', env);
  const location = requiredEnv('CLOUD_TASKS_LOCATION', env);
  const queueId = requiredEnv('CLOUD_TASKS_QUEUE_ID', env);
  const oidcServiceAccountEmail = requiredEnv('CLOUD_TASKS_OIDC_SERVICE_ACCOUNT_EMAIL', env);

  if (!projectId || !location || !queueId || !oidcServiceAccountEmail) {
    return null;
  }

  return { projectId, location, queueId, oidcServiceAccountEmail };
}

function getClient() {
  client ??= new CloudTasksClient();
  return client;
}

export function buildCloudTaskRequest(args: {
  payload: ReportScanInferencePayload;
  config: CloudTasksConfig;
  targetUrl: string;
}) {
  const parent = `projects/${args.config.projectId}/locations/${args.config.location}/queues/${args.config.queueId}`;
  const target = new URL(args.targetUrl);

  return {
    parent,
    task: {
      name: `${parent}/tasks/${TASK_PREFIX}${args.payload.jobId}`,
      httpRequest: {
        httpMethod: 'POST' as const,
        url: target.toString(),
        headers: {
          'Content-Type': 'application/json',
        },
        body: Buffer.from(JSON.stringify(args.payload)),
        oidcToken: {
          serviceAccountEmail: args.config.oidcServiceAccountEmail,
          audience: target.origin,
        },
      },
      dispatchDeadline: {
        seconds: 900,
      },
    },
  };
}

function isAlreadyExistsError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'message' in error) &&
    ((error as { code?: unknown }).code === ALREADY_EXISTS_CODE ||
      String((error as { message?: unknown }).message ?? '').includes('ALREADY_EXISTS'))
  );
}

export async function enqueueCloudTask(
  input: ReportScanInferencePayload,
  opts: { targetUrl: string }
) {
  const config = getCloudTasksConfig();
  if (!config) {
    return null;
  }

  const payload = reportScanInferencePayloadSchema.parse(input);
  const request = buildCloudTaskRequest({ payload, config, targetUrl: opts.targetUrl });

  try {
    await getClient().createTask(request);
    return { mode: 'cloud_tasks' as const };
  } catch (error) {
    if (isAlreadyExistsError(error)) {
      return { mode: 'cloud_tasks' as const };
    }
    throw error;
  }
}
