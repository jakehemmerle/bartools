import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test';

const createTaskCalls: unknown[] = [];
let nextCreateTaskError: Error | null = null;

mock.module('@google-cloud/tasks', () => ({
  CloudTasksClient: class {
    async createTask(request: unknown) {
      createTaskCalls.push(request);
      if (nextCreateTaskError) {
        throw nextCreateTaskError;
      }
      return [{ name: 'created-task' }];
    }
  },
}));

const { buildCloudTaskRequest, enqueueCloudTask, getCloudTasksConfig } = await import('./cloud-tasks');

const ENV_KEYS = [
  'CLOUD_TASKS_PROJECT_ID',
  'CLOUD_TASKS_LOCATION',
  'CLOUD_TASKS_QUEUE_ID',
  'CLOUD_TASKS_OIDC_SERVICE_ACCOUNT_EMAIL',
] as const;

const savedEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

const payload = {
  jobId: '00000000-0000-0000-0000-000000000101',
  reportId: '00000000-0000-0000-0000-000000000102',
  scanId: '00000000-0000-0000-0000-000000000103',
};
const oidcServiceAccountEmail =
  'bartools-backend-staging@bartools-staging.iam.gserviceaccount.com';

beforeEach(() => {
  createTaskCalls.length = 0;
  nextCreateTaskError = null;
  process.env.CLOUD_TASKS_PROJECT_ID = 'bartools-staging';
  process.env.CLOUD_TASKS_LOCATION = 'us-east1';
  process.env.CLOUD_TASKS_QUEUE_ID = 'bartools-report-inference-staging';
  process.env.CLOUD_TASKS_OIDC_SERVICE_ACCOUNT_EMAIL = oidcServiceAccountEmail;
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    const saved = savedEnv[key];
    if (saved === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = saved;
    }
  }
});

describe('Cloud Tasks inference enqueue', () => {
  test('returns null when Cloud Tasks env is incomplete', () => {
    delete process.env.CLOUD_TASKS_QUEUE_ID;
    expect(getCloudTasksConfig()).toBeNull();
  });

  test('builds a deterministic authenticated HTTP task', () => {
    const config = getCloudTasksConfig();
    expect(config).not.toBeNull();

    const request = buildCloudTaskRequest({
      payload,
      config: config!,
      targetUrl:
        'https://bartools-backend-staging-zjausnxoyq-ue.a.run.app/internal/tasks/report-scan-inference',
    });

    expect(request.parent).toBe(
      'projects/bartools-staging/locations/us-east1/queues/bartools-report-inference-staging'
    );
    expect(request.task.name).toBe(`${request.parent}/tasks/report-scan-${payload.jobId}`);
    expect(request.task.httpRequest.url).toBe(
      'https://bartools-backend-staging-zjausnxoyq-ue.a.run.app/internal/tasks/report-scan-inference'
    );
    expect(request.task.httpRequest.httpMethod).toBe('POST');
    expect(request.task.httpRequest.oidcToken).toEqual({
      serviceAccountEmail: oidcServiceAccountEmail,
      audience: 'https://bartools-backend-staging-zjausnxoyq-ue.a.run.app',
    });
    expect(JSON.parse(Buffer.from(request.task.httpRequest.body).toString('utf8'))).toEqual(
      payload
    );
  });

  test('enqueues a Cloud Task when configured', async () => {
    const result = await enqueueCloudTask(payload, {
      targetUrl: 'https://example.test/internal/tasks/report-scan-inference',
    });

    expect(result).toEqual({ mode: 'cloud_tasks' });
    expect(createTaskCalls).toHaveLength(1);
  });

  test('treats duplicate task names as successful enqueue', async () => {
    nextCreateTaskError = Object.assign(new Error('ALREADY_EXISTS'), { code: 6 });

    const result = await enqueueCloudTask(payload, {
      targetUrl: 'https://example.test/internal/tasks/report-scan-inference',
    });

    expect(result).toEqual({ mode: 'cloud_tasks' });
  });
});
