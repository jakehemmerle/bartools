import * as gcp from '@pulumi/gcp';
import type * as pulumi from '@pulumi/pulumi';

export function createServiceAccount(opts: {
  project: string;
  env: string;
  dependsOn: pulumi.Resource[];
}) {
  return new gcp.serviceaccount.Account(
    `backend-sa`,
    {
      project: opts.project,
      accountId: `bartools-backend-${opts.env}`,
      displayName: `BarTools backend (${opts.env})`,
    },
    { dependsOn: opts.dependsOn }
  );
}
