import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

export function createUploadsBucket(opts: {
  project: string;
  region: string;
  env: string;
  forceDestroy: boolean;
  serviceAccountEmail: pulumi.Output<string>;
  dependsOn: pulumi.Resource[];
}) {
  const bucket = new gcp.storage.Bucket(
    `uploads`,
    {
      project: opts.project,
      name: `bartools-uploads-${opts.env}`,
      location: opts.region,
      forceDestroy: opts.forceDestroy,
      uniformBucketLevelAccess: true,
      publicAccessPrevention: 'enforced',
      versioning: { enabled: false },
      lifecycleRules: [
        {
          action: { type: 'AbortIncompleteMultipartUpload' },
          condition: { age: 1 },
        },
      ],
      cors: [
        {
          methods: ['PUT', 'GET'],
          origins: ['*'],
          responseHeaders: ['Content-Type'],
          maxAgeSeconds: 3600,
        },
      ],
    },
    { dependsOn: opts.dependsOn }
  );

  // Grant objectAdmin scoped to the bucket itself (NOT project-wide).
  new gcp.storage.BucketIAMMember(`uploads-object-admin`, {
    bucket: bucket.name,
    role: 'roles/storage.objectAdmin',
    member: pulumi.interpolate`serviceAccount:${opts.serviceAccountEmail}`,
  });

  // Let the SA sign GCS URLs via IAM Credentials' signBlob (no JSON key needed).
  new gcp.serviceaccount.IAMMember(`backend-sa-token-creator`, {
    serviceAccountId: pulumi.interpolate`projects/${opts.project}/serviceAccounts/${opts.serviceAccountEmail}`,
    role: 'roles/iam.serviceAccountTokenCreator',
    member: pulumi.interpolate`serviceAccount:${opts.serviceAccountEmail}`,
  });

  return bucket;
}
