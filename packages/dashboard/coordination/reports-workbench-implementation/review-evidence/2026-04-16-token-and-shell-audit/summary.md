# Token And Shell Audit

- Date: `2026-04-16`
- Branch: `PL-02-respond-to-backend`
- Base commit: `9b82e0b`
- Viewport: `1440x900`
- Real routes reviewed: `/`, `/reports`
- Review routes reviewed:
  - `/__review/reports/empty`
  - `/__review/report/created`
  - `/__review/report/processing`
  - `/__review/report/unreviewed`
  - `/__review/report/reviewed`
  - `/__review/report/comparison`
  - `/__review/report/failed`
  - `/__review/report/blocked`
  - `/__review/report/not-found`
- Browser verification:
  - `/reports` loaded with `overlay=false`
  - `/reports` loaded with `hasContent=true`
- Test commands run:
  - `bun --filter @bartools/dashboard lint`
  - `bun --filter @bartools/dashboard typecheck`
  - `bun --filter @bartools/dashboard test`
  - `bun --filter @bartools/dashboard build`

## What Changed

- Centralized the remaining shared report-workbench color helpers in `src/index.css` so route styles consume named theme roles instead of ad hoc raw values.
- Centralized shared typography roles in `src/index.css` and `src/app/theme/typography.ts` so shell, list, and detail surfaces pull from the same heading/body/label hierarchy.
- Tightened shell and list styling to use those shared roles, including the public-shell ambient wash, wordmark, page titles, list headers, status chips, and empty states.
- Tightened detail-family styling to use the same token roles for metadata labels, helper text, comparison labels, resolved-value emphasis, blocked/not-found icon treatments, and active fill controls.
- Added lint-time enforcement in `scripts/enforce-code-quality.mjs` so route CSS may not introduce raw hex or `rgb`/`rgba` colors outside `src/index.css`.

## Screens Intentionally Touched

- entry shell
- reports list
- reports empty state
- created state
- processing state
- unreviewed state
- reviewed state
- comparison state
- failed state
- blocked state
- not-found state

## Screens Captured

- `01-entry.png`
- `02-reports-list.png`
- `03-reports-empty.png`
- `04-report-created.png`
- `05-report-processing.png`
- `06-report-unreviewed.png`
- `07-report-reviewed.png`
- `08-report-comparison.png`
- `09-report-failed.png`
- `10-report-blocked.png`
- `11-report-not-found.png`

## Review Gates Exercised

- full desktop capture sweep at `1440x900`
- browser verification on `/reports`
- route and review harness tests
- lint, typecheck, test, and production build

## What Still Looks Off

- `06-report-unreviewed.png` and `09-report-failed.png` still expose a native select under the product-match area, so the control reads more implementation-shaped than the approved bespoke search treatment.
- `04-report-created.png` still renders the explainer slab as a very thin band instead of a more deliberate quiet card.
- `05-report-processing.png` is semantically right, but the report-identity slab and passive rows still feel more scaffold-like than the approved composition.
- `07-report-reviewed.png` and `08-report-comparison.png` now sit inside the right token system, but the reviewed/comparison card family still needs a later fidelity pass to match the approved composition more tightly.

## Continuation Decision

Every reviewed screen passed semantically, and no screen failed hard enough to stop execution.

Execution continued past this pass.
