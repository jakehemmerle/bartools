# Runbook

Operational recipes. Every command assumes you're at the repo root unless noted.

Substitute `<env>` with `staging` or `prod`.

## Checks

### Is it up?

```bash
curl -fsS $(pulumi -C infra stack output healthUrl --stack <env>)
# -> {"ok":true}
```

### What revision is currently serving traffic?

```bash
gcloud run services describe bartools-backend-<env> \
  --region us-east1 --project bartools-<env> \
  --format='value(status.latestReadyRevisionName, status.traffic)'
```

### What image is deployed?

```bash
gcloud run services describe bartools-backend-<env> \
  --region us-east1 --project bartools-<env> \
  --format='value(spec.template.spec.containers[0].image)'
```

Or from Pulumi's record of the last deploy:
```bash
pulumi -C infra stack output imageUri --stack <env>
```

## Logs

### Tail logs live

```bash
gcloud run services logs tail bartools-backend-<env> \
  --region us-east1 --project bartools-<env>
```

### Read the last N log lines

```bash
gcloud run services logs read bartools-backend-<env> \
  --region us-east1 --project bartools-<env> --limit 50
```

### Filter for errors

```bash
gcloud logging read \
  'resource.type="cloud_run_revision"
   AND resource.labels.service_name="bartools-backend-<env>"
   AND severity>=ERROR' \
  --project bartools-<env> --limit 50 \
  --format='value(timestamp,textPayload,jsonPayload.message)'
```

## Deploys

### Normal deploy (after a code change)

```bash
bash infra/scripts/deploy.sh <env>
```

The image tag is `git rev-parse --short HEAD`, so commit before deploying. Include a schema change? Run `push-schema.sh <env>` first.

### Roll back to the previous revision

Cloud Run keeps old revisions. Route 100% of traffic to a specific revision:

```bash
# List recent revisions (newest first)
gcloud run revisions list \
  --service bartools-backend-<env> \
  --region us-east1 --project bartools-<env> \
  --limit 5

# Pin traffic to an older revision
gcloud run services update-traffic bartools-backend-<env> \
  --region us-east1 --project bartools-<env> \
  --to-revisions <revision-name>=100
```

After rollback, re-point Pulumi state to match — otherwise the next `pulumi up` will overwrite the rollback:
```bash
# Option A: redeploy the older git SHA
git checkout <older-sha>
bash infra/scripts/deploy.sh <env>
git checkout <branch>

# Option B: accept the drift until the next forward deploy
# (fine for a short hotfix window)
```

### Force a no-op redeploy (e.g., reload secret)

Bumping the secret version doesn't trigger a Cloud Run revision. Force one:
```bash
gcloud run services update bartools-backend-<env> \
  --region us-east1 --project bartools-<env> \
  --update-env-vars FORCE_REDEPLOY=$(date +%s)
# or just re-run: bash infra/scripts/deploy.sh <env>
```

## Secrets

### Read the `DATABASE_URL` the container sees

```bash
gcloud secrets versions access latest \
  --secret=database-url-<env> --project=bartools-<env>
```

### Rotate `DATABASE_URL` (after a Neon password reset or branch recreation)

```bash
# 1) Grab new pooled URL
NEW_URL="$(neon connection-string <main|staging> \
  --project-id floral-hill-07191329 \
  --database-name neondb --pooled)"

# 2) Write to Pulumi (will be pushed to Secret Manager on next `pulumi up`)
source infra/scripts/_env.sh
pulumi -C infra config set --stack <env> --secret bartools:databaseUrl "$NEW_URL"

# 3) Apply — creates a new SecretVersion; latest ref is auto-picked
source infra/scripts/_env.sh
pulumi -C infra up --stack <env> --yes

# 4) Force a revision so the running container picks it up
gcloud run services update bartools-backend-<env> \
  --region us-east1 --project bartools-<env> \
  --update-env-vars FORCE_REDEPLOY=$(date +%s)
```

## Scaling

### Change min/max instances

Edit `infra/Pulumi.<env>.yaml`:
```yaml
config:
  bartools:minInstances: "1"   # keep one warm
  bartools:maxInstances: "5"
```
Then `bash infra/scripts/deploy.sh <env>`.

### Temporarily block ingress

```bash
gcloud run services update bartools-backend-<env> \
  --region us-east1 --project bartools-<env> \
  --ingress internal
# revert with: --ingress all
```

## Cloud Tasks inference

Report submit creates DB-backed inference jobs and enqueues one Cloud Task per
scan. Cloud Tasks calls `POST /internal/tasks/report-scan-inference` with an
OIDC token minted for the backend service account. The endpoint validates the
token before claiming and processing the job.

### Inspect the queue

```bash
gcloud tasks queues describe bartools-report-inference-<env> \
  --location us-east1 --project bartools-<env>

gcloud tasks list \
  --queue=bartools-report-inference-<env> \
  --location us-east1 --project bartools-<env>
```

### Watch task dispatch logs

```bash
gcloud logging read \
  'resource.type="cloud_tasks_queue"
   AND resource.labels.queue_id="bartools-report-inference-<env>"' \
  --project bartools-<env> --limit 50 \
  --format='value(timestamp,severity,jsonPayload.status,textPayload)'
```

### Retry a stuck queued job

If a report is still `processing`, first check whether there are pending Cloud
Tasks and whether any inference jobs are already `running`. Fresh `running`
jobs intentionally return HTTP 503 to Cloud Tasks so the same task retries
later instead of starting duplicate inferencing.

```bash
gcloud tasks list \
  --queue=bartools-report-inference-<env> \
  --location us-east1 --project bartools-<env>

gcloud run services logs read bartools-backend-<env> \
  --region us-east1 --project bartools-<env> --limit 100 \
  | grep -E 'Cloud Tasks|inference|report-scan'
```

### Recreate a missing queue

The queue is managed by Pulumi:

```bash
source infra/scripts/_env.sh
pulumi -C infra up --stack <env> --yes
```

Do not delete the App Engine application. Cloud Tasks requires it, and the App
Engine application location is effectively permanent for the GCP project.

## Neon

### Create an ad-hoc branch for a spike

```bash
neon branches create \
  --project-id floral-hill-07191329 \
  --name <branch-name> \
  --parent main

neon connection-string <branch-name> \
  --project-id floral-hill-07191329 \
  --database-name neondb --pooled
```

Point staging at it temporarily:
```bash
source infra/scripts/_env.sh
pulumi -C infra config set --stack staging --secret bartools:databaseUrl "$(neon connection-string <branch-name> --project-id floral-hill-07191329 --database-name neondb --pooled)"
bash infra/scripts/deploy.sh staging
```

Reset back to the real staging branch when done:
```bash
bash infra/scripts/provision-neon.sh   # rewrites both stacks' databaseUrl secrets
bash infra/scripts/deploy.sh staging
```

### Reset the staging branch to a fresh copy of main

```bash
neon branches delete staging --project-id floral-hill-07191329
neon branches create --project-id floral-hill-07191329 --name staging --parent main
bash infra/scripts/provision-neon.sh   # re-derives the URL
bash infra/scripts/push-schema.sh staging
bash infra/scripts/deploy.sh staging
```

## GCS uploads bucket

Bucket: `bartools-uploads-<env>`. The backend writes via pre-signed PUT URLs it
mints itself using the attached Cloud Run service account and the IAM
Credentials API's `signBlob`. **There are no AWS keys, no HMAC keys, and no
downloaded JSON credentials to rotate** — auth rotates automatically with the
SA.

### List bucket contents

```bash
# Top-level listing
gcloud storage ls gs://bartools-uploads-<env>/ \
  --project bartools-<env>

# Recursive, with sizes and timestamps
gcloud storage ls -l -r gs://bartools-uploads-<env>/** \
  --project bartools-<env>
```

### Inspect a single object's metadata

```bash
gcloud storage objects describe gs://bartools-uploads-<env>/<object-name> \
  --project bartools-<env>
```

Includes contentType, size, md5, storageClass, generation, and custom
metadata (useful for debugging the uploader).

### Delete orphaned objects

Common causes of orphans: client got a pre-signed PUT, uploaded, but never
posted the "attach to report" request back to the backend. These have no DB
row pointing at them.

```bash
# Dry-run: list what you'd delete
gcloud storage ls -l gs://bartools-uploads-<env>/<path>/ \
  --project bartools-<env>

# Delete one object
gcloud storage rm gs://bartools-uploads-<env>/<object-name> \
  --project bartools-<env>

# Delete a prefix (careful)
gcloud storage rm -r gs://bartools-uploads-<env>/<prefix>/ \
  --project bartools-<env>
```

For bulk orphan cleanup, the recommended workflow is to diff the bucket
listing against the DB's set of known object keys and `rm` the difference.
We don't have a dedicated script yet; write an ad-hoc one if orphan volume
grows.

Note: the bucket has a lifecycle rule that aborts incomplete multipart uploads
after 1 day, so partial uploads don't accrue cost.

### "Auth rotation"

Not applicable. The container's identity is the Cloud Run service account
`bartools-backend-<env>@bartools-<env>.iam.gserviceaccount.com`. Replace the
SA only if it's been compromised; otherwise there's nothing to rotate.

## Schema

### Push changes to one env

```bash
bash infra/scripts/push-schema.sh <env>
```

Always staging first. Review the diff prompt — `drizzle-kit push` will ask before dropping columns/tables.

### Inspect current schema

```bash
cd packages/backend
DATABASE_URL="$(PULUMI_CONFIG_PASSPHRASE_FILE=~/.config/bartools/pulumi-passphrase pulumi -C ../../infra config get --stack <env> bartools:databaseUrl)" bunx drizzle-kit studio
```

## Common failure modes

### "lockfile had changes, but lockfile is frozen"

**Where:** during `docker build` on the `bun install --frozen-lockfile` step.
**Root cause:** the Dockerfile didn't copy every workspace's `package.json` before `bun install`. Bun sees the lockfile references packages whose manifests aren't present → considers the lockfile drifted.
**Fix:** ensure `packages/backend/Dockerfile` copies **every** `packages/*/package.json` in the deps stage. If you added a new workspace, add a matching COPY line.

### "The following reserved env names were provided: PORT"

**Where:** `pulumi up` during Cloud Run service create.
**Root cause:** Cloud Run injects `PORT` automatically; you can't override it. The container must listen on whatever `PORT` is set to (we hard-code 3000 and Cloud Run matches via `containerPort`).
**Fix:** don't add `PORT` to the `envs` array in `infra/src/run.ts`.

### Container starts but `Cannot find package '...'`

**Where:** container logs on first revision.
**Root cause:** Bun hoists workspace deps into per-package `node_modules` dirs, not just root. If the Dockerfile's runtime stage copies only `/app/node_modules` from deps, per-workspace deps are missing.
**Fix:** runtime stage should `COPY --from=deps /app /app` (whole tree) and then overlay source. See `packages/backend/Dockerfile`.

### "Cloud billing quota exceeded" when linking a project

**Where:** `gcloud billing projects link`.
**Root cause:** per-billing-account limit on the number of linked projects.
**Fix:** use a different billing account for the new project (that's why prod and staging use different accounts), or unlink a dormant project first: `gcloud billing projects list --billing-account <ID>`.

### `pulumi` says "passphrase must be set"

**Where:** first `pulumi` command in a new shell.
**Root cause:** self-managed backend encrypts secrets with a passphrase; our scripts source `_env.sh` to export `PULUMI_CONFIG_PASSPHRASE_FILE`. You forgot to source it when running pulumi directly.
**Fix:**
```bash
source infra/scripts/_env.sh
pulumi -C infra <cmd>
```

### "ERR_MODULE_NOT_FOUND" from `infra/index.ts`

**Where:** `pulumi preview` / `pulumi up`.
**Root cause:** `infra/package.json` has `"type": "module"` (Node ESM), which breaks Pulumi's TypeScript loader.
**Fix:** remove `"type": "module"`; keep `tsconfig.json` at `"module": "commonjs"`. Already done — don't re-add it.

### Compute Engine API "accessNotConfigured" warning

**Where:** every `pulumi up`, as a yellow warning.
**Root cause:** the Pulumi GCP provider tries to list available compute regions for validation. We don't use Compute Engine.
**Fix:** ignore. Or enable `compute.googleapis.com` if you want the warning gone — but it's cosmetic and costs nothing either way.
