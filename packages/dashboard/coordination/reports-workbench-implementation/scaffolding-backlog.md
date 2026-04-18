# Scaffolding Backlog

This is the first implementation-facing checklist.

It is intentionally concrete and file-oriented.

## Pass 1: Folder And Route Scaffold

- add `src/features/reports/`
- move or wrap current reports page logic under feature-owned files
- add review harness route definitions
- add a small scenario selector or explicit route-per-scenario mapping for local inspection
- keep production routes simple and clean

## Pass 2: Theme And Primitive Scaffold

- create dashboard-local token source for colors, spacing, radii, typography intent
- add BARTOOLS-specific chip/label/logo primitives
- define shared surface primitives if repetition becomes obvious
- remove remaining starter-feeling shell styles
- use the canonical file layout from `architecture-and-file-plan.md`

## Pass 3: Screen Skeleton Scaffold

- create list page container component
- create empty-state component
- create detail page container component
- create detail header component
- create record-card component
- create record-media component
- create review-controls component
- create comparison panel component

These components can ship as structure-first placeholders before full styling.

## Pass 4: Fixture Review Scaffold

- map each golden-set screen to a named scenario
- ensure blocked and not-found are explicit scenarios
- ensure comparison-heavy and failed-heavy detail scenarios exist
- ensure reviewed and unreviewed scenarios are distinct fixture objects

## Pass 5: Test Scaffold

- add route tests for review harness routes
- add tests for review payload generation after UI refactor
- add tests for status chip formatting if extracted
- add tests for scenario-to-screen mapping if it becomes non-trivial

## Files Likely To Be Modified Early

- `src/app/router.tsx`
- `src/components/layout/public-shell.tsx`
- `src/components/layout/authenticated-shell.tsx`
- `src/pages/reports-page.tsx`
- `src/index.css`
- `src/app/theme.ts`
- `src/app/providers.tsx`
- `src/lib/reports/client.ts`
- `src/lib/reports/provider.tsx`

## Files Likely To Be Added Early

- `src/app/theme/tokens.ts`
- `src/app/theme/typography.ts`
- `src/app/theme/semantic-colors.ts`
- `src/components/shell/public/public-shell.tsx`
- `src/components/shell/public/public-top-bar.tsx`
- `src/components/shell/workbench/workbench-shell.tsx`
- `src/components/shell/workbench/workbench-top-bar.tsx`
- `src/components/shell/workbench/workbench-canvas.tsx`
- `src/features/reports/routes/reports-route.tsx`
- `src/features/reports/routes/report-detail-route.tsx`
- `src/features/reports/components/entry-screen.tsx`
- `src/features/reports/components/reports-list-screen.tsx`
- `src/features/reports/components/reports-empty-screen.tsx`
- `src/features/reports/components/reports-list-row.tsx`
- `src/features/reports/components/report-detail-screen.tsx`
- `src/features/reports/components/report-header.tsx`
- `src/features/reports/components/report-record-card.tsx`
- `src/features/reports/components/report-review-controls.tsx`
- `src/features/reports/components/report-comparison-panel.tsx`
- `src/features/reports/fixtures/review-scenarios.ts`

## First Practical Cut

If implementation starts immediately after this planning pass, the best first coding move is:

1. build theme and shell primitives
2. add review harness routes
3. rebuild reports list and detail shell structure

That ordering gives us visible progress fast while preserving room for detailed record-state work.
