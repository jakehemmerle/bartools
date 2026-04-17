# infra

Pulumi (TypeScript) IaC for the BarBack backend. Two stacks, two GCP projects, one Neon project with two branches.

> **Looking for a specific URL, ID, or recipe?**
> - Resource IDs and URLs → [`RESOURCES.md`](./RESOURCES.md)
> - Day-2 ops (logs, rollback, rotate secret, etc.) → [`RUNBOOK.md`](./RUNBOOK.md)

## Architecture

```
┌─────────────────────────┐     TLS     ┌──────────────────────────────┐
│  Cloud Run v2 service   │ ──────────> │  Neon Postgres (pooled)      │
│  bartools-backend-<env> │  sslmode=   │  floral-hill-07191329        │
│  us-east1               │  verify-full│  branches: main, staging     │
└────────┬────────────────┘             └──────────────────────────────┘
         │ pulls image
         ▼
┌─────────────────────────┐
│  Artifact Registry      │
│  us-east1/bartools      │
└─────────────────────────┘

Secret: DATABASE_URL lives in Secret Manager (secret `database-url-<env>`),
        mounted into Cloud Run via secret ref. Only the per-env service
        account has accessor role.
Ingress: public. allUsers → roles/run.invoker on the Cloud Run service.
State:   gs://bartools-pulumi-state (self-managed Pulumi backend).
```

## Stacks

| Stack     | GCP project        | Billing                | Cloud Run service         | Neon branch | Max instances |
| --------- | ------------------ | ---------------------- | ------------------------- | ----------- | ------------- |
| `staging` | `bartools-staging` | My Billing Account 1   | `bartools-backend-staging` | `staging`   | 1             |
| `prod`    | `bartools-prod`    | g4                     | `bartools-backend-prod`    | `main`      | 3             |

Region pair: Cloud Run `us-east1` ↔ Neon `aws-us-east-1`.

> **Why split billing?** g4 hit its per-account project-link quota during bootstrap. Prod stayed on g4; staging fell back to My Billing Account 1. Not a mistake — just what the billing quota allowed.

## Prerequisites (one-time, per laptop)

| Tool     | Minimum | Auth / setup                                                             |
| -------- | ------- | ------------------------------------------------------------------------ |
| `gcloud` | any current | `gcloud auth login` + `gcloud auth application-default login`        |
| `neon`   | any current | `neon auth` (pick `Jake` org)                                        |
| `pulumi` | 3.215+  | `pulumi login gs://bartools-pulumi-state` (done automatically by bootstrap) |
| `bun`    | 1.3+    | —                                                                        |
| `docker` | 28+     | Docker Desktop running; `gcloud auth configure-docker us-east1-docker.pkg.dev` (done automatically by bootstrap) |
| `jq`     | any     | —                                                                        |

Install infra deps once:
```bash
cd infra
bun install
```

## From zero to a live service

```bash
# 1) Stack init + docker credential helper (run once per env, idempotent)
bash scripts/bootstrap.sh staging
bash scripts/bootstrap.sh prod

# 2) Neon provisioning (once; writes DATABASE_URL into BOTH stack configs)
bash scripts/provision-neon.sh

# 3) Staging first: schema, deploy, smoke-test
bash scripts/push-schema.sh staging
bash scripts/deploy.sh staging

# 4) Promote to prod once staging is green
bash scripts/push-schema.sh prod
bash scripts/deploy.sh prod
```

## Redeploying after a code change

```bash
# Whatever you have committed (git short SHA becomes the image tag)
bash infra/scripts/deploy.sh staging
# ...smoke test...
bash infra/scripts/deploy.sh prod
```

If you changed the Drizzle schema, run `push-schema.sh <env>` before `deploy.sh <env>`.

## Day-2 ops quick index

See [`RUNBOOK.md`](./RUNBOOK.md) for:

- Tail Cloud Run logs
- Roll back to a previous revision
- Rotate `DATABASE_URL` after a Neon password reset
- Scale min/max instances
- Create an ad-hoc Neon branch for a spike
- Recover from common failure modes (frozen-lockfile, `PORT` reserved, Bun workspace hoisting, billing quota)

## Known limitations

- `packages/backend/src/uploads.ts` writes photos to local FS. Fine at `maxInstances=1`; prod is `max=3` and loses uploads across instances. Follow-up: GCS bucket.
- Schema is pushed per-env via `drizzle-kit push` — no drift detection, no migrations table. Review the `drizzle-kit push` diff carefully before confirming on prod.
- No auth in front of Cloud Run. `/health` and every API is publicly reachable.

## Teardown

```bash
pulumi -C infra destroy --stack staging --yes
pulumi -C infra destroy --stack prod --yes

# Neon (separate; Pulumi doesn't own it)
neon branches delete staging --project-id floral-hill-07191329
neon projects delete floral-hill-07191329

# State bucket (after last destroy)
gcloud storage rm --recursive gs://bartools-pulumi-state
```
