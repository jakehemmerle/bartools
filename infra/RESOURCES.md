# Resource reference

Every ID, URL, and location for the BarBack backend infra. If a value ever looks stale, prefer the **"re-derive"** command over the cached value — the commands are the source of truth.

## Service URLs (the pingable thing)

| Stack     | URL                                                                 |
| --------- | ------------------------------------------------------------------- |
| `staging` | `https://bartools-backend-staging-zjausnxoyq-ue.a.run.app`          |
| `prod`    | `https://bartools-backend-prod-ovhqgvlj5q-ue.a.run.app`             |

**Public endpoints** (same on both stacks):
- `GET /` → `{"service":"bartools-backend","ok":true}`
- `GET /health` → `{"ok":true}`
- `GET /reports`, `POST /reports`, `GET /reports/:id`, `POST /reports/:id/photos`, `POST /reports/:id/submit`, `GET /reports/:id/stream`, `POST /reports/:id/review`
- `GET /bottles/search?q=…`
- `GET /venues/:venueId/locations`
- `GET /uploads/:filename` (ephemeral — see README limitations)

### Re-derive a URL

```bash
# From Pulumi (source of truth)
pulumi -C infra stack output serviceUrl --stack <staging|prod>

# From gcloud
gcloud run services describe bartools-backend-<env> \
  --region us-east1 --project bartools-<env> \
  --format='value(status.url)'
```

## GCP projects

| Field                     | staging                                              | prod                                        |
| ------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| Project ID                | `bartools-staging`                                   | `bartools-prod`                             |
| Project number            | *(run `gcloud projects describe bartools-<env>`)*    | *(same)*                                    |
| Billing account           | My Billing Account 1 (`01EF47-F039EB-B6F997`)        | g4 (`01D40C-CD85AA-0486B4`)                 |
| Region                    | `us-east1`                                           | `us-east1`                                  |
| Cloud Run service         | `bartools-backend-staging`                           | `bartools-backend-prod`                     |
| Service account email     | `bartools-backend-staging@bartools-staging.iam.gserviceaccount.com` | `bartools-backend-prod@bartools-prod.iam.gserviceaccount.com` |
| Secret Manager secret     | `database-url-staging`                               | `database-url-prod`                         |
| Artifact Registry repo    | `us-east1-docker.pkg.dev/bartools-staging/bartools`  | `us-east1-docker.pkg.dev/bartools-prod/bartools` |
| Image name                | `backend:<git-short-sha>`                            | `backend:<git-short-sha>`                   |
| GCS uploads bucket        | `bartools-uploads-staging`                           | `bartools-uploads-prod`                     |

### GCP consoles

- Staging Cloud Run: https://console.cloud.google.com/run?project=bartools-staging
- Prod Cloud Run: https://console.cloud.google.com/run?project=bartools-prod
- Staging logs: https://console.cloud.google.com/logs/query?project=bartools-staging
- Prod logs: https://console.cloud.google.com/logs/query?project=bartools-prod

## Neon

Single project, two branches. One connection pool per branch.

| Field              | Value                                  |
| ------------------ | -------------------------------------- |
| Neon org           | `org-withered-mud-28878668` (Jake)     |
| Project ID         | `floral-hill-07191329`                 |
| Project name       | `bartools`                             |
| Region             | `aws-us-east-1`                        |
| Postgres version   | 17                                     |
| Database name      | `neondb`                               |
| main branch ID     | `br-twilight-mode-am1m9fyx` (→ prod)   |
| staging branch ID  | `br-shiny-leaf-amtcnjss` (→ staging)   |
| Console            | https://console.neon.tech/app/projects/floral-hill-07191329 |

### Re-derive a connection string

```bash
# Pooled (what Cloud Run uses)
neon connection-string main --project-id floral-hill-07191329 \
  --database-name neondb --pooled

neon connection-string staging --project-id floral-hill-07191329 \
  --database-name neondb --pooled

# Unpooled (for drizzle-kit or admin tasks)
neon connection-string main --project-id floral-hill-07191329 \
  --database-name neondb
```

### Read the URL that's actually deployed

```bash
# From Pulumi config (what was last pushed to Secret Manager)
pulumi -C infra config get --stack <env> bartools:databaseUrl

# From Secret Manager (authoritative — what the running container sees)
gcloud secrets versions access latest \
  --secret=database-url-<env> --project=bartools-<env>
```

## GCS uploads buckets

One regional bucket per env, used by the backend for pre-signed PUT uploads. Auth to GCS is via the attached Cloud Run service account; there are no HMAC keys or JSON credentials to rotate.

| Field                      | staging                        | prod                         |
| -------------------------- | ------------------------------ | ---------------------------- |
| Bucket name                | `bartools-uploads-staging`     | `bartools-uploads-prod`      |
| Location                   | `us-east1`                     | `us-east1`                   |
| Uniform bucket-level access| enabled                        | enabled                      |
| Public access prevention   | `enforced`                     | `enforced`                   |
| Versioning                 | disabled                       | disabled                     |
| `forceDestroy`             | `true` (iterate freely)        | `false` (destroy-locked)     |
| Lifecycle                  | abort incomplete multipart uploads after 1 day | same       |
| CORS                       | `PUT,GET` from `*`, `Content-Type` header, maxAge 3600s | same (tighten before GA) |

### IAM bindings (bucket-scoped, not project-scoped)

- `roles/storage.objectAdmin` on the bucket → `serviceAccount:bartools-backend-<env>@bartools-<env>.iam.gserviceaccount.com`
- `roles/iam.serviceAccountTokenCreator` on the SA itself → the same SA as member. Required so the backend can call the IAM Credentials API's `signBlob` to mint V4 pre-signed URLs without a downloaded private key.

### Required Google APIs (enabled per project)

- `iamcredentials.googleapis.com` — needed for `signBlob` self-signing
- `storage.googleapis.com` — bucket CRUD + object ops

Both are in `infra/src/apis.ts` alongside the other enabled APIs.

### Env vars delivered to the backend container

Plain env vars on the Cloud Run service (NOT Secret Manager):

- `GCS_BUCKET` ← `bartools-uploads-<env>` (wired from `bucket.name`)
- `GCS_PRESIGNED_PUT_TTL_SECONDS` ← `"300"`

### Re-derive bucket name

```bash
pulumi -C infra stack output uploadsBucketName --stack <env>

# or via gcloud
gcloud storage buckets list --project bartools-<env> --format='value(name)' \
  | grep bartools-uploads
```

## Pulumi

| Field                 | Value                                                         |
| --------------------- | ------------------------------------------------------------- |
| Backend               | `gs://bartools-pulumi-state` (self-managed, versioned)        |
| Stack names           | `staging`, `prod`                                             |
| Stack state URIs      | `gs://bartools-pulumi-state/.pulumi/stacks/bartools/<env>.json` |
| Passphrase file       | `~/.config/bartools/pulumi-passphrase` (600, auto-generated)   |
| Project file          | `infra/Pulumi.yaml`                                            |
| Stack config (staging) | `infra/Pulumi.staging.yaml`                                   |
| Stack config (prod)   | `infra/Pulumi.prod.yaml`                                       |

### Re-derive stack output

```bash
# All outputs
pulumi -C infra stack output --stack <env>

# One output
pulumi -C infra stack output serviceUrl --stack <env>
pulumi -C infra stack output healthUrl --stack <env>
pulumi -C infra stack output imageUri --stack <env>
pulumi -C infra stack output serviceName --stack <env>
pulumi -C infra stack output uploadsBucketName --stack <env>
```

## CLI tools quick reference

| Task                           | Command                                                                 |
| ------------------------------ | ----------------------------------------------------------------------- |
| Which gcloud account?          | `gcloud config list`                                                    |
| Switch gcloud project          | `gcloud config set project bartools-<env>`                              |
| Which Pulumi stack?            | `pulumi -C infra stack --stack <env>`                                   |
| Neon auth / org                | `neon me --output json`                                                 |
| List Neon branches             | `neon branches list --project-id floral-hill-07191329`                  |
| List GCP projects              | `gcloud projects list`                                                  |
| List Cloud Run services        | `gcloud run services list --project bartools-<env>`                     |
| List Artifact Registry images  | `gcloud artifacts docker images list us-east1-docker.pkg.dev/bartools-<env>/bartools` |
| List uploads bucket contents   | `gcloud storage ls gs://bartools-uploads-<env>/`                        |

## Infra file map

```
infra/
├── Pulumi.yaml             # project definition (runtime: nodejs/bun, main: index.ts)
├── Pulumi.staging.yaml     # per-stack config (GCP project, region, scaling)
├── Pulumi.prod.yaml
├── index.ts                # entrypoint — wires the modules below together
├── package.json            # @pulumi/gcp, @pulumi/docker-build, @pulumi/pulumi
├── tsconfig.json           # CommonJS (required by Pulumi's nodejs runtime)
├── src/
│   ├── apis.ts             # gcp.projects.Service for every required googleapi
│   ├── registry.ts         # gcp.artifactregistry.Repository
│   ├── service-account.ts  # gcp.serviceaccount.Account
│   ├── secret.ts           # Secret Manager secret + IAM member
│   ├── storage.ts          # gcp.storage.Bucket + bucket IAM + SA tokenCreator
│   ├── image.ts            # docker-build.Image (build context = repo root)
│   └── run.ts              # gcp.cloudrunv2.Service + public invoker binding
├── scripts/
│   ├── _env.sh             # sets PULUMI_CONFIG_PASSPHRASE_FILE (sourced by all)
│   ├── bootstrap.sh        # per-env stack init + docker cred helper
│   ├── provision-neon.sh   # creates Neon project + staging branch + stashes secrets
│   ├── push-schema.sh      # drizzle-kit push against a given env's Neon branch
│   └── deploy.sh           # pulumi up <env> + health curl
├── README.md               # primary operator entry point
├── RESOURCES.md            # this file
└── RUNBOOK.md              # day-2 recipes + known failure modes
```
