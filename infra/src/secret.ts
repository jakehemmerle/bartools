import * as gcp from '@pulumi/gcp';
import * as pulumi from '@pulumi/pulumi';

export function createBackendSecret(opts: {
  name: string;
  project: string;
  env: string;
  value: pulumi.Output<string>;
  serviceAccountEmail: pulumi.Output<string>;
  dependsOn: pulumi.Resource[];
}) {
  const secret = new gcp.secretmanager.Secret(
    opts.name,
    {
      project: opts.project,
      secretId: `${opts.name}-${opts.env}`,
      replication: { auto: {} },
    },
    { dependsOn: opts.dependsOn }
  );

  const version = new gcp.secretmanager.SecretVersion(`${opts.name}-v1`, {
    secret: secret.id,
    secretData: opts.value,
  });

  new gcp.secretmanager.SecretIamMember(`${opts.name}-access`, {
    project: opts.project,
    secretId: secret.secretId,
    role: 'roles/secretmanager.secretAccessor',
    member: pulumi.interpolate`serviceAccount:${opts.serviceAccountEmail}`,
  });

  return { secretId: secret.secretId, version };
}
