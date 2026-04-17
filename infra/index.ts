import * as pulumi from '@pulumi/pulumi';
import { enableApis } from './src/apis';
import { createArtifactRegistry } from './src/registry';
import { createServiceAccount } from './src/service-account';
import { createBackendSecret } from './src/secret';
import { createUploadsBucket } from './src/storage';
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
const claudeCodeOauthToken = bartoolsConfig.requireSecret('claudeCodeOauthToken');
const langsmithApiKey = bartoolsConfig.requireSecret('langsmithApiKey');

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

const databaseUrlSecret = createBackendSecret({
  name: 'database-url',
  project,
  env,
  value: databaseUrl,
  serviceAccountEmail: serviceAccount.email,
  dependsOn: apiServices,
});

const claudeCodeOauthTokenSecret = createBackendSecret({
  name: 'claude-code-oauth-token',
  project,
  env,
  value: claudeCodeOauthToken,
  serviceAccountEmail: serviceAccount.email,
  dependsOn: apiServices,
});

const langsmithApiKeySecret = createBackendSecret({
  name: 'langsmith-api-key',
  project,
  env,
  value: langsmithApiKey,
  serviceAccountEmail: serviceAccount.email,
  dependsOn: apiServices,
});

const uploadsBucket = createUploadsBucket({
  project,
  region,
  env,
  // Allow iterating freely in staging; prod buckets are destroy-locked.
  forceDestroy: env !== 'prod',
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
  databaseUrlSecretId: databaseUrlSecret.secretId,
  claudeCodeOauthTokenSecretId: claudeCodeOauthTokenSecret.secretId,
  langsmithApiKeySecretId: langsmithApiKeySecret.secretId,
  gcsBucketName: uploadsBucket.name,
  gcsPresignedPutTtlSeconds: '300',
  minInstances,
  maxInstances,
  cpu,
  memory,
  dependsOn: [
    databaseUrlSecret.version,
    claudeCodeOauthTokenSecret.version,
    langsmithApiKeySecret.version,
  ],
});

export const serviceName = runService.name;
export const serviceUrl = runService.uri;
export const healthUrl = pulumi.interpolate`${runService.uri}/health`;
export const imageRef = image.ref;
export const uploadsBucketName = uploadsBucket.name;
