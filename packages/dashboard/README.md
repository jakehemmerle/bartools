# Dashboard

## Current product shape

The web dashboard is a reports-first workbench.

As of April 19, 2026:

- `/reports` and `/reports/:reportId` can read live backend data when `VITE_BARTOOLS_API_BASE_URL` is set.
- `/reports/backstock/new` is partly live: it can load venue locations and search bottles, and it falls back to demo locations when no venue id is configured, but photo generation and final submit are still fixture-only when backend mode is enabled.
- there is no real web auth flow yet
- `/sign-in`, `/sign-up`, and `/reset-password` currently redirect to `/reports`
- the staging backend itself is also still public; there is no auth layer in front of Cloud Run today

That means a deployed dashboard will not show a login screen yet, and "seeded login info" from the backend team is not enough on its own to unlock a web session flow.

## Local development

From the repo root:

```sh
bun run dev:dashboard
```

Staging-backed local smoke path:

```sh
bun run dev:dashboard:staging
```

This runs the dashboard with:

- `VITE_BARTOOLS_API_BASE_URL=/api`
- `BARTOOLS_API_PROXY_TARGET=https://bartools-backend-staging-zjausnxoyq-ue.a.run.app`

## Railway deploy

The checked-in Railway deploy path uses:

- repo-root [`railway.toml`](../../railway.toml)
- [`Dockerfile`](./Dockerfile)
- [`Caddyfile`](./Caddyfile)
- [`scripts/deploy-railway.sh`](./scripts/deploy-railway.sh)

Why the script exists:

- the repo contains unrelated files and editor metadata that can make raw `railway up .` brittle
- the script builds a temporary upload bundle with only the files the dashboard image actually needs
- Railway then builds from that trimmed bundle with `--path-as-root`

### One-time setup

1. Log in to Railway.
2. Link this checkout to the Railway project/service that should host the dashboard.
3. Set the backend proxy target on the Railway service:

```sh
railway variables set BARTOOLS_API_PROXY_TARGET=https://bartools-backend-staging-zjausnxoyq-ue.a.run.app
```

### Deploy

From the repo root:

```sh
bun run deploy:dashboard:railway
```

Or from the dashboard package:

```sh
bun run deploy:railway
```

Useful options:

```sh
sh ./scripts/deploy-railway.sh --dry-run
sh ./scripts/deploy-railway.sh --service dashboard --keep-temp
```

## Live backend constraints

The current web app does not derive venue or user identity from auth yet.

Instead, the existing live hooks rely on runtime wiring:

- `VITE_BARTOOLS_API_BASE_URL`
- `VITE_BARTOOLS_VENUE_ID` (optional for the current demo flow)
- `VITE_BARTOOLS_REVIEWER_USER_ID` (optional override)

Today that means:

- live report list/detail can work without user auth
- review submission can reuse the report's seeded backend user id, with `VITE_BARTOOLS_REVIEWER_USER_ID` available as an override
- live backstock location loading can fall back to demo locations when `VITE_BARTOOLS_VENUE_ID` is unset
- live backstock submit is still blocked pending backend contract support
