# Summary

This pass resolved the last obvious mobile detail-header seam introduced by using canonical backend UUIDs in report titles.

## What changed

- The detail header now keeps the full backend heading for semantics and testing.
- On mobile, the visual hero reads `Report` instead of `Report <uuid>`.
- The full report ID moves into a smaller support line directly underneath the hero.
- Desktop still renders the full `Report <uuid>` title unchanged.

## Why this is better

The prior mobile layout was technically stable but visually noisy. The heading forced a UUID to compete with the actual page title, which made the screen feel heavier than the approved designs. The new structure preserves backend truth while restoring a cleaner title hierarchy.

## Validation

- `bun --filter @bartools/dashboard lint`
- `bun --filter @bartools/dashboard typecheck`
- `bun --filter @bartools/dashboard test`
- `bun --filter @bartools/dashboard build`

All four commands passed on April 16, 2026.

## Captures

- Reviewed mobile: `screens/07-report-reviewed-mobile.png`
- Failed mobile: `screens/09-report-failed-mobile.png`

## Residual Note

The full report ID is still visible on mobile, just demoted out of the hero. That is intentional: it keeps the backend identifier present without letting it dominate the screen.
