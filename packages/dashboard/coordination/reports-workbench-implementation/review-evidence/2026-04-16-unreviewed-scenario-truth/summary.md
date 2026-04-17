# Unreviewed Scenario Truth Pass

- Date: `2026-04-16`
- Branch: `PL-02-respond-to-backend`
- Base commit: `9b82e0b`
- Viewport: `1440x900`
- Review route captured:
  - `/__review/report/unreviewed`
- Test commands run:
  - `bun --filter @bartools/dashboard lint`
  - `bun --filter @bartools/dashboard typecheck`
  - `bun --filter @bartools/dashboard test`
  - `bun --filter @bartools/dashboard build`

## What Changed

- Rebuilt the canonical unreviewed review fixture so it contains two inferred reviewable records instead of inheriting a failed record from the base scenario.
- Kept the failed-emphasis route on its own dedicated all-failed scenario, so the two detail families no longer bleed into each other.
- Added route and scenario tests to prevent failed-state leakage from reappearing in the primary unreviewed screen.
- Split record-card internals into smaller components during the same pass so the detail family stays under the file-size cap while this screen continues to evolve.

## Screens Captured

- `06-report-unreviewed.png`

## Review Gates Exercised

- desktop browser capture at `1440x900`
- lint, typecheck, test, and production build

## What Still Looks Off

- The overall unreviewed record-card composition still needs a later fidelity pass to get closer to the approved mockup's spacing and media art direction.
- The selected-result row is semantically correct and calmer than the native select it replaced, but it still reads slightly more implementation-shaped than the golden mockup's tighter bespoke field treatment.

## Continuation Decision

The canonical unreviewed review route now matches the intended product state instead of showing mixed failed-state content.

Execution continued past this pass.
