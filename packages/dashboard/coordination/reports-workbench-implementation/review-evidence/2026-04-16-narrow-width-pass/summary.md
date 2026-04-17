# Narrow Width Pass

- Date: `2026-04-16`
- Branch: `PL-02-respond-to-backend`
- Base commit: `9b82e0b`
- Viewport: `390x844`
- Routes captured:
  - `/reports`
  - `/__review/report/reviewed`
  - `/__review/report/failed`
- Test commands run:
  - `bun --filter @bartools/dashboard lint`
  - `bun --filter @bartools/dashboard typecheck`
  - `bun --filter @bartools/dashboard test`
  - `bun --filter @bartools/dashboard build`

## What Changed

- Reworked narrow-width report rows so they no longer collapse into anonymous card blobs; they now keep `Report ID`, `Operator`, `Started`, and `Bottles` legible inside each row.
- Tightened narrow shell spacing and reduced mobile title scale so detail routes stop feeling oversized and top-heavy on phones.
- Restacked reviewed metadata on narrow widths so it reads like operational metadata instead of a desktop-right-aligned cluster awkwardly wrapped onto a phone.
- Reduced narrow detail padding and failed-media height so reviewed and failed cards breathe better in the small viewport.

## Screens Captured

- `02-reports-list.png`
- `07-report-reviewed.png`
- `09-report-failed.png`

## Review Gates Exercised

- narrow viewport browser capture at `390x844`
- lint, typecheck, test, and production build

## What Still Looks Off

- The narrow reports list is much more informative, but it still reads a bit card-heavy because the desktop-first row family is being compressed rather than fully redesigned for mobile.
- The narrow reviewed route is calmer and more legible, but the comparison card itself is still vertically long once the field stack expands.
- The failed route is materially calmer than before, but the placeholder media is still visually louder than final bottle photography would be.

## Continuation Decision

The narrow-width pass closed the biggest mobile drift: the list, reviewed, and failed screens now read like intentional compressed work surfaces instead of desktop layouts reluctantly folded in half.

Execution continued past this pass.
