# Bottle Match Control

- Date: `2026-04-16`
- Branch: `PL-02-respond-to-backend`
- Base commit: `9b82e0b`
- Viewport: `1440x900`
- Review routes captured:
  - `/__review/report/unreviewed`
  - `/__review/report/reviewed`
  - `/__review/report/comparison`
  - `/__review/report/failed`
- Test commands run:
  - `bun --filter @bartools/dashboard lint`
  - `bun --filter @bartools/dashboard typecheck`
  - `bun --filter @bartools/dashboard test`
  - `bun --filter @bartools/dashboard build`

## What Changed

- Replaced the native product-match select in reviewable record states with a bespoke searchable result list that fits the approved detail-family language more closely.
- Reused that control in both unreviewed and failed record treatments so the product-match interaction no longer forks into two unrelated UI patterns.
- Kept selection state visible inside the result list with an explicit `Selected` tag and token-aligned emphasis.
- Reset `searchState` when report detail data resolves so stale query/results do not leak across report navigation.
- Added `report-bottle-match-field.test.tsx` to protect the custom result-list behavior and keep native combobox drift from quietly reappearing.

## Screens Captured

- `06-report-unreviewed.png`
- `07-report-reviewed.png`
- `08-report-comparison.png`
- `09-report-failed.png`

## Review Gates Exercised

- desktop browser capture at `1440x900`
- lint, typecheck, test, and production build

## What Still Looks Off

- `06-report-unreviewed.png` now reads much better, but the overall record-card composition still needs a later fidelity pass to tighten spacing and hierarchy against the approved mockup.
- `09-report-failed.png` now uses the right interaction family, but the placeholder media and overall card proportion still look more implementation-shaped than final-art-directed.
- `07-report-reviewed.png` and `08-report-comparison.png` were captured as adjacent detail-family references; they remain semantically correct, but the reviewed/comparison layouts still need a later polish pass.

## Continuation Decision

No semantic regressions were introduced, and the product-match control is materially closer to the approved design family than the native select it replaced.

Execution continued past this pass.
