# Implementation Kickoff Checklist

## Purpose

This is the practical bridge between planning and building.

Use it before and during the first implementation passes so we do not:

- drift back into older dashboard-era assumptions
- touch the wrong files first
- start visible UI work before the review harness is trustworthy
- smuggle dependency changes into "small frontend cleanup"

## Current Authority Check

Before starting a ticket, confirm the active planning stack is:

1. `screen-inventory.md`
2. `screen-composition-spec.md`
3. `state-visibility-matrix.md`
4. `visual-token-spec.md`
5. `architecture-and-file-plan.md`
6. `ticket-backlog.md`
7. `autonomy-envelope.md`
8. `dependency-decision-policy.md`
9. `architecture-defaults.md`
10. `visual-deviation-policy.md`
11. `evidence-runbook.md`

If an older root-level coordination doc says something different, treat it as history unless it is explicitly reconciled.

## Opening Ticket Chain

The first implementation stretch should follow this order:

1. `RWB-001` router inventory lock
2. `RWB-002` legacy layout cleanup
3. `RWB-049` fixture session runtime quarantine
4. `RWB-050` legacy fixture scope quarantine
5. `RWB-003` token contract audit
6. `RWB-004` typography role audit
7. `RWB-009` scenario coverage audit
8. `RWB-010` review route naming and coverage lock
9. `RWB-051` review scenario structural test pass
10. `RWB-012` review route test matrix
11. `RWB-041` review evidence scaffold
12. `RWB-005` public shell fidelity
13. `RWB-006` workbench shell fidelity
14. `RWB-013` reports list loading state pass
15. `RWB-014` reports empty state fidelity
16. `RWB-015` reports list row composition
17. `RWB-042` shell and list evidence pass

Do not skip ahead to detail-state fidelity before this chain is meaningfully underway.

## Files Expected Early

These are the files most likely to change in the opening stretch:

- `src/app/router.tsx`
- `src/app/providers.tsx`
- `src/index.css`
- `src/app/theme/tokens.ts`
- `src/app/theme/typography.ts`
- `src/app/theme/semantic-colors.ts`
- `src/components/shell/public/public-shell.tsx`
- `src/components/shell/public/public-top-bar.tsx`
- `src/components/shell/workbench/workbench-shell.tsx`
- `src/components/shell/workbench/workbench-top-bar.tsx`
- `src/components/shell/workbench/workbench-canvas.tsx`
- `src/components/primitives/app-wordmark.tsx`
- `src/components/primitives/status-chip.tsx`
- `src/components/primitives/surface-card.tsx`
- `src/features/reports/fixtures/review-scenarios.ts`
- `src/features/reports/routes/review-*.tsx`
- `src/features/reports/routes/review-detail-preview.tsx`
- `src/features/reports/components/entry-screen.tsx`
- `src/features/reports/components/reports-list-screen.tsx`
- `src/features/reports/components/reports-empty-screen.tsx`
- `src/features/reports/components/reports-list-row.tsx`
- `src/lib/fixture-session.tsx`
- `src/lib/fixtures/scenarios.ts`

## Review Harness Preconditions

Before a screen-fidelity ticket is treated as complete:

- the relevant review route exists
- the relevant scenario exists
- scenario structure is protected by tests where appropriate
- route reachability is protected by tests where appropriate
- the evidence scaffold exists for the screen family

If one of those is missing, the ticket is not really done.

## First-Pass Scenario Checklist

These scenarios must stay healthy before detail-state work expands:

- `entry`
- `reports-list`
- `reports-empty`
- `report-created`
- `report-processing`
- `report-unreviewed`
- `report-reviewed`
- `report-comparison`
- `report-failed`
- `report-blocked`
- `report-not-found`

## First-Pass Test Checklist

The early execution stretch should land these protections as soon as possible:

- router tests for real routes and legacy redirects
- review route tests for all approved review screens
- structural tests for the named review scenarios
- list route/component tests once row composition starts changing

## First Evidence Checklist

Before we claim the shell and list family are in good shape, capture:

- `01-entry.png`
- `02-reports-list.png`
- `03-reports-empty.png`

And create:

- `summary.md`
- `checklist.md`
- `screens/`

under a dated folder in `review-evidence/`.

## Dependency Red Flags

Pause and get explicit approval before touching:

- `packages/dashboard/package.json`
- `bun.lock`

Especially if the change would:

- add a new UI dependency
- replace `react-aria-components`
- alter Storybook or test-runner dependencies
- reintroduce a framework-level styling library

## Runtime Cleanup Red Flags

Do not quietly preserve old runtime baggage just because it is already working.

Call it out explicitly if a ticket reveals that:

- `FixtureSessionProvider` is still doing real work for the current app
- old inventory/settings fixture models are still coupled to active reports rendering
- a redirect route has started carrying real UI again

## Definition Of Ready To Leave The Opening Stretch

We are ready to move deeper into detail-family implementation when:

- the app root no longer carries confusing old dashboard runtime baggage
- the shell family is visually coherent
- the review harness is deterministic
- the route and scenario tests exist
- the first evidence bundle exists
- reports list screens no longer read like starter scaffolding
