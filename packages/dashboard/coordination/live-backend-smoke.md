# Live Backend Smoke

## Purpose

This is the fastest safe path for testing the web dashboard against the real backend without waiting on browser CORS.

The dashboard already supports:

- fixture mode
- direct backend mode
- proxied backend mode through local Vite dev

Right now, proxied backend mode is the useful one.

## Current Reality

As of April 17, 2026:

- staging `GET /reports` returns `{"reports":[]}`
- staging does not advertise `Access-Control-Allow-Origin` for `http://localhost:5173`
- real browser live mode should therefore go through the local Vite proxy

That means:

- do not expect the dashboard to talk directly to staging from the browser yet
- do expect proxied local dev to be the normal smoke path for now

## Launch Commands

From repo root:

```sh
bun run dev:dashboard:staging
```

From the dashboard package:

```sh
bun run dev:staging
```

Default local address:

```text
http://127.0.0.1:4174
```

## What The Staging Script Does

The staging script sets:

- `VITE_BARTOOLS_API_BASE_URL=/api`
- `BARTOOLS_API_PROXY_TARGET=https://bartools-backend-staging-zjausnxoyq-ue.a.run.app`
- host `127.0.0.1`
- port `4174`

The app then uses backend mode, while Vite proxies `/api/*` to staging.

## Useful Overrides

If the staging host changes:

```sh
BARTOOLS_API_PROXY_TARGET=https://new-host.example bun run dev:dashboard:staging
```

If port `4174` is busy:

```sh
BARTOOLS_DASHBOARD_DEV_PORT=4175 bun run dev:dashboard:staging
```

If host binding needs to change:

```sh
BARTOOLS_DASHBOARD_DEV_HOST=0.0.0.0 bun run dev:dashboard:staging
```

## Smoke Checklist

### Mode And Shell

- open `/reports`
- confirm the top bar shows `Live`, not `Fixtures`
- confirm unsupported dashboard surfaces are still absent from active navigation

### Reports List

- if staging is empty, confirm the empty state is calm and product-facing
- if staging has reports, confirm each row renders:
  - report id
  - status
  - operator if present
  - location if present
  - `processedCount / photoCount`
  - bottle count

### Report Detail

- open a known report if staging has one
- confirm statuses render correctly:
  - `created`
  - `processing`
  - `unreviewed`
  - `reviewed`
- confirm failed records do not crash the page
- confirm reviewed records still show original vs final values when available

### Review State

- if backend returns `bottleId` on records, confirm the review field shows the saved match
- confirm the review action stays calm and blocked until real user context exists
- confirm the UI never invents account bootstrap or unsupported auth behavior

### Network Reality

- confirm list reads `GET /reports`
- confirm detail reads `GET /reports/:reportId`
- confirm review submit remains blocked in the UI until backend user context exists

## Expected Outcomes Today

With current staging data, the most likely result is:

- `Live` mode boots correctly
- `/reports` renders the empty state from a real backend response
- no meaningful detail-state smoke is possible until staging has seeded reports

That is still useful.
It proves the live transport path, not the full product path.
