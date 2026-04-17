import * as gcp from '@pulumi/gcp';

const REQUIRED_APIS = [
  'run.googleapis.com',
  'artifactregistry.googleapis.com',
  'secretmanager.googleapis.com',
  'iam.googleapis.com',
  'cloudresourcemanager.googleapis.com',
  'serviceusage.googleapis.com',
] as const;

export function enableApis(project: string) {
  return REQUIRED_APIS.map(
    (api) =>
      new gcp.projects.Service(`svc-${api.split('.')[0]}`, {
        project,
        service: api,
        disableOnDestroy: false,
      })
  );
}
