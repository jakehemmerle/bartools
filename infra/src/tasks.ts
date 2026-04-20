import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

export function createReportInferenceQueue(opts: {
  project: string;
  region: string;
  env: string;
  serviceAccountEmail: pulumi.Output<string>;
  serviceAccountName: pulumi.Output<string>;
  dependsOn: pulumi.Resource[];
}) {
  const queueId = `bartools-report-inference-${opts.env}`;

  const app = new gcp.appengine.Application(
    'app-engine',
    {
      project: opts.project,
      locationId: opts.region,
    },
    { dependsOn: opts.dependsOn }
  );

  const queue = new gcp.cloudtasks.Queue(
    'report-inference-queue',
    {
      project: opts.project,
      location: opts.region,
      name: queueId,
      rateLimits: {
        maxConcurrentDispatches: 1,
        maxDispatchesPerSecond: 1,
      },
      retryConfig: {
        maxAttempts: 5,
        minBackoff: '30s',
        maxBackoff: '300s',
        maxDoublings: 4,
        maxRetryDuration: '1800s',
      },
      stackdriverLoggingConfig: {
        samplingRatio: 1,
      },
    },
    { dependsOn: [app] }
  );

  new gcp.cloudtasks.QueueIamMember(
    'report-inference-queue-enqueuer',
    {
      project: opts.project,
      location: opts.region,
      name: queue.name,
      role: 'roles/cloudtasks.enqueuer',
      member: pulumi.interpolate`serviceAccount:${opts.serviceAccountEmail}`,
    },
    { dependsOn: [queue] }
  );

  new gcp.serviceaccount.IAMMember(
    'backend-task-oidc-self-user',
    {
      serviceAccountId: opts.serviceAccountName,
      role: 'roles/iam.serviceAccountUser',
      member: pulumi.interpolate`serviceAccount:${opts.serviceAccountEmail}`,
    },
    { dependsOn: [queue] }
  );

  return {
    queue,
    queueId,
  };
}
