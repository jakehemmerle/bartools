# Reviewed Family Realignment

- Date: `2026-04-16`
- Branch: `PL-02-respond-to-backend`
- Base commit: `9b82e0b`
- Viewport: `1440x900`
- Review routes captured:
  - `/__review/report/reviewed`
  - `/__review/report/comparison`
- Test commands run:
  - `bun --filter @bartools/dashboard lint`
  - `bun --filter @bartools/dashboard typecheck`
  - `bun --filter @bartools/dashboard test`
  - `bun --filter @bartools/dashboard build`

## What Changed

- Realigned the reviewed screen so every reviewed record renders in the same comparison-card language instead of mixing a resolved-card layout with a comparison-card layout.
- Kept the reviewed grid comparison-led even when a record has no correction delta, which makes final values remain visible truth instead of collapsing back to a different card family.
- Added a preview-only hero comparison variant for the dedicated comparison review route so that route now has a record header with a media token and explicit original-versus-final fill rails.
- Trimmed the comparison-emphasis shell so it no longer drags the standard reviewed metadata cluster into the hero-card composition.
- Updated route tests to lock the new reviewed-family semantics and keep comparison labels visible across both reviewed and comparison-emphasis states.

## Screens Captured

- `07-report-reviewed.png`
- `08-report-comparison.png`

## Review Gates Exercised

- desktop browser capture at `1440x900`
- lint, typecheck, test, and production build

## What Still Looks Off

- `07-report-reviewed.png` is now structurally aligned, but the metadata cluster and card proportions still need a later spacing polish to match the approved mockup more tightly.
- `08-report-comparison.png` is materially closer to the hero-card design, but the route still reuses the standard report-title shell rather than a fully bespoke comparison-emphasis heading treatment.
- Placeholder media still uses fixture art, so the hero comparison card is compositionally stronger than it is visually final.

## Continuation Decision

The reviewed family now reads as one coherent system, and the dedicated comparison route has a materially stronger hero treatment than the generic single-card reviewed layout it replaced.

Execution continued past this pass.
