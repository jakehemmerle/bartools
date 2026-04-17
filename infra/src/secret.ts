import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

export function createDatabaseUrlSecret(opts: {
  project: string;
  env: string;
  databaseUrl: pulumi.Output<string>;
  serviceAccountEmail: pulumi.Output<string>;
  dependsOn: pulumi.Resource[];
}) {
  const secret = new gcp.secretmanager.Secret(
    `database-url`,
    {
      project: opts.project,
      secretId: `database-url-${opts.env}`,
      replication: { auto: {} },
    },
    { dependsOn: opts.dependsOn }
  );

  const version = new gcp.secretmanager.SecretVersion(`database-url-v1`, {
    secret: secret.id,
    secretData: opts.databaseUrl,
  });

  new gcp.secretmanager.SecretIamMember(`database-url-access`, {
    project: opts.project,
    secretId: secret.secretId,
    role: 'roles/secretmanager.secretAccessor',
    member: pulumi.interpolate`serviceAccount:${opts.serviceAccountEmail}`,
  });

  return { secretId: secret.secretId, version };
}
