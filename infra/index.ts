import * as pulumi from '@pulumi/pulumi';
import { enableApis } from './src/apis';
import { createArtifactRegistry } from './src/registry';
import { createServiceAccount } from './src/service-account';
import { createDatabaseUrlSecret } from './src/secret';
import { buildAndPushImage } from './src/image';
import { createCloudRunService } from './src/run';
import { execSync } from 'node:child_process';

const gcpConfig = new pulumi.Config('gcp');
const bartoolsConfig = new pulumi.Config('bartools');

const project = gcpConfig.require('project');
const region = gcpConfig.require('region');
const env = bartoolsConfig.require('env');
const minInstances = Number(bartoolsConfig.require('minInstances'));
const maxInstances = Number(bartoolsConfig.require('maxInstances'));
const cpu = bartoolsConfig.require('cpu');
const memory = bartoolsConfig.require('memory');

const databaseUrl = bartoolsConfig.requireSecret('databaseUrl');

const imageTag = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();

const apiServices = enableApis(project);

const registry = createArtifactRegistry({
  project,
  region,
  env,
  dependsOn: apiServices,
});

const serviceAccount = createServiceAccount({
  project,
  env,
  dependsOn: apiServices,
});

const secretResources = createDatabaseUrlSecret({
  project,
  env,
  databaseUrl,
  serviceAccountEmail: serviceAccount.email,
  dependsOn: apiServices,
});

const image = buildAndPushImage({
  project,
  region,
  imageTag,
  repositoryName: registry.repositoryId,
});

const runService = createCloudRunService({
  project,
  region,
  env,
  serviceAccountEmail: serviceAccount.email,
  imageUri: image.ref,
  databaseUrlSecretId: secretResources.secretId,
  minInstances,
  maxInstances,
  cpu,
  memory,
  dependsOn: [secretResources.version],
});

export const serviceName = runService.name;
export const serviceUrl = runService.uri;
export const healthUrl = pulumi.interpolate`${runService.uri}/health`;
export const imageRef = image.ref;
