import * as gcp from '@pulumi/gcp';
import type * as pulumi from '@pulumi/pulumi';

export function createArtifactRegistry(opts: {
  project: string;
  region: string;
  env: string;
  dependsOn: pulumi.Resource[];
}) {
  return new gcp.artifactregistry.Repository(
    `backend-repo`,
    {
      project: opts.project,
      location: opts.region,
      repositoryId: 'bartools',
      format: 'DOCKER',
      description: `BarTools backend images (${opts.env})`,
    },
    { dependsOn: opts.dependsOn }
  );
}
