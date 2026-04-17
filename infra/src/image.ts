import * as docker from '@pulumi/docker-build';
import * as pulumi from '@pulumi/pulumi';
import { resolve } from 'node:path';

export function buildAndPushImage(opts: {
  project: string;
  region: string;
  imageTag: string;
  repositoryName: pulumi.Output<string>;
  dependsOn: pulumi.Resource[];
}) {
  const tag = pulumi.interpolate`${opts.region}-docker.pkg.dev/${opts.project}/${opts.repositoryName}/backend:${opts.imageTag}`;

  return new docker.Image(
    `backend-image`,
    {
      tags: [tag],
      context: { location: resolve(__dirname, '../..') },
      dockerfile: { location: resolve(__dirname, '../../packages/backend/Dockerfile') },
      platforms: ['linux/amd64'],
      push: true,
    },
    { dependsOn: opts.dependsOn }
  );
}
