# Failed State Quieting

- Date: `2026-04-16`
- Branch: `PL-02-respond-to-backend`
- Base commit: `9b82e0b`
- Viewport: `1440x900`
- Review route captured:
  - `/__review/report/failed`
- Test commands run:
  - `bun --filter @bartools/dashboard lint`
  - `bun --filter @bartools/dashboard typecheck`
  - `bun --filter @bartools/dashboard test`
  - `bun --filter @bartools/dashboard build`

## What Changed

- Changed the failed-state preview initialization so failed records no longer boot with the full bottle-result list already expanded.
- Preserved draft bottle matches where they exist, but kept the visible control in a quiet prefilled-or-empty state until the user actively searches.
- Added a route test to prevent the failed screen from regressing into an always-open result list on first render.

## Screens Captured

- `09-report-failed.png`

## Review Gates Exercised

- desktop browser capture at `1440x900`
- lint, typecheck, test, and production build

## What Still Looks Off

- The failed card composition is calmer, but the media slab is still oversized relative to the approved mockup.
- Product-match still uses the bespoke search field rather than the literal dropdown-looking control in the mockup; that is an intentional interaction decision, but the visual treatment still needs more polish.
- Placeholder media remains fixture art rather than final bottle imagery.

## Continuation Decision

The failed route now lands in a much calmer default state and better matches the intended “recoverable operational work” tone.

Execution continued past this pass.
