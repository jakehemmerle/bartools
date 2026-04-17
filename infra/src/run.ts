import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

export function createCloudRunService(opts: {
  project: string;
  region: string;
  env: string;
  serviceAccountEmail: pulumi.Output<string>;
  imageUri: pulumi.Output<string>;
  databaseUrlSecretId: pulumi.Output<string>;
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
              {
                name: 'DATABASE_URL',
                valueSource: {
                  secretKeyRef: {
                    secret: opts.databaseUrlSecretId,
                    version: 'latest',
                  },
                },
              },
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
