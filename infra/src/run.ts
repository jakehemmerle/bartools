import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

const secretEnv = (name: string, secret: pulumi.Output<string>) => ({
  name,
  valueSource: { secretKeyRef: { secret, version: 'latest' } },
});

export function createCloudRunService(opts: {
  project: string;
  region: string;
  env: string;
  serviceAccountEmail: pulumi.Output<string>;
  imageUri: pulumi.Output<string>;
  databaseUrlSecretId: pulumi.Output<string>;
  claudeCodeOauthTokenSecretId: pulumi.Output<string>;
  langsmithApiKeySecretId: pulumi.Output<string>;
  gcsBucketName: pulumi.Input<string>;
  cloudTasks?: {
    projectId: string;
    location: string;
    queueId: string;
    oidcServiceAccountEmail: pulumi.Output<string>;
  };
  minInstances: number;
  maxInstances: number;
  cpu: string;
  memory: string;
  dependsOn: pulumi.Resource[];
}) {
  const service = new gcp.cloudrunv2.Service(
    `backend`,
    {
      project: opts.project,
      location: opts.region,
      name: `bartools-backend-${opts.env}`,
      ingress: 'INGRESS_TRAFFIC_ALL',
      deletionProtection: false,
      template: {
        serviceAccount: opts.serviceAccountEmail,
        scaling: {
          minInstanceCount: opts.minInstances,
          maxInstanceCount: opts.maxInstances,
        },
        timeout: '900s',
        containers: [
          {
            image: opts.imageUri,
            ports: { containerPort: 3000 },
            resources: {
              limits: { cpu: opts.cpu, memory: opts.memory },
              cpuIdle: true,
              startupCpuBoost: true,
            },
            envs: [
              { name: 'BARTOOLS_ENV', value: opts.env },
              { name: 'GCS_BUCKET', value: pulumi.output(opts.gcsBucketName) },
              { name: 'GCS_PRESIGNED_PUT_TTL_SECONDS', value: '300' },
              ...(opts.cloudTasks
                ? [
                    { name: 'CLOUD_TASKS_PROJECT_ID', value: opts.cloudTasks.projectId },
                    { name: 'CLOUD_TASKS_LOCATION', value: opts.cloudTasks.location },
                    { name: 'CLOUD_TASKS_QUEUE_ID', value: opts.cloudTasks.queueId },
                    {
                      name: 'CLOUD_TASKS_OIDC_SERVICE_ACCOUNT_EMAIL',
                      value: opts.cloudTasks.oidcServiceAccountEmail,
                    },
                  ]
                : []),
              secretEnv('DATABASE_URL', opts.databaseUrlSecretId),
              secretEnv('CLAUDE_CODE_OAUTH_TOKEN', opts.claudeCodeOauthTokenSecretId),
              secretEnv('LANGSMITH_API_KEY', opts.langsmithApiKeySecretId),
            ],
            startupProbe: {
              httpGet: { path: '/health', port: 3000 },
              initialDelaySeconds: 2,
              periodSeconds: 3,
              failureThreshold: 15,
              timeoutSeconds: 2,
            },
            livenessProbe: {
              httpGet: { path: '/health', port: 3000 },
              periodSeconds: 30,
              timeoutSeconds: 3,
              failureThreshold: 3,
            },
          },
        ],
      },
    },
    { dependsOn: opts.dependsOn }
  );

  new gcp.cloudrunv2.ServiceIamMember(`backend-public`, {
    project: opts.project,
    location: opts.region,
    name: service.name,
    role: 'roles/run.invoker',
    member: 'allUsers',
  });

  return service;
}
