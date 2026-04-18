# Execution Plan

## Delivery Goal

Move from the current reports-first scaffold to a production-ready web reports workbench that:
- matches the approved screen set
- preserves backend semantics
- remains fixture-reviewable throughout development

## Phase 0: Planning Scaffold

Goal:
- create the implementation docs
- define routes, screen inventory, and file boundaries

Done when:
- this folder exists
- the document set is coherent enough to guide implementation

## Phase 1: Design Token And Shell Refactor

Goal:
- make the app feel like BARTOOLS before refining individual screens

Tasks:
- extract dashboard-local visual tokens from mobile-aligned direction
- remove Mantine provider/theme assumptions
- introduce React Aria as the interaction primitive layer
- refactor public shell and workbench shell
- remove obvious library-demo styling
- establish page width, spacing, header, and surface rules

Files likely touched:
- `src/app/theme/tokens.ts`
- `src/app/theme/typography.ts`
- `src/app/theme/semantic-colors.ts`
- `src/app/providers.tsx`
- `src/index.css`
- `src/components/shell/public/public-shell.tsx`
- `src/components/shell/public/public-top-bar.tsx`
- `src/components/shell/workbench/workbench-shell.tsx`
- `src/components/shell/workbench/workbench-top-bar.tsx`
- `src/components/shell/workbench/workbench-canvas.tsx`
- new shell/primitives files if extracted

Exit criteria:
- `/` and `/reports` already look like the same product family
- no route still looks like starter scaffolding

## Phase 2: Review Harness And Scenario Routing

Goal:
- make every approved screen directly inspectable

Tasks:
- add explicit review harness routes
- map each harness route to one golden-set scenario
- keep client/provider fixture-backed by default
- ensure blocked and not-found states are deterministic

Exit criteria:
- every approved screen has a stable local route
- reviewers can compare local UI against golden-set images directly

## Phase 3: Reports List Fidelity Pass

Goal:
- rebuild reports list and empty state to match the approved designs

Tasks:
- replace generic table presentation
- implement BARTOOLS-owned list rows instead of library-shaped table defaults
- implement final row/card composition
- align status chip treatment
- implement empty state in same family

Exit criteria:
- reports list route and empty state route visually match approved references

## Phase 4: Detail Shell And Shared Record Structure

Goal:
- establish the detail-page family before per-state refinement

Tasks:
- implement report detail header
- implement shared record-card structure
- implement media area and fallback
- implement shared metadata sections

Exit criteria:
- created, processing, unreviewed, reviewed, failed, and comparison all render within one coherent page family

## Phase 5: Stateful Detail Variants

Goal:
- implement each detail-state variant faithfully

Tasks:
- created state
- processing state
- unreviewed state
- reviewed state
- blocked state
- not-found state

Exit criteria:
- each state route has distinct, approved behavior without branching chaos

## Phase 6: Review Controls And Comparison Fidelity

Goal:
- implement the hard parts of the workbench accurately

Tasks:
- product match control
- fill-level tenths control
- final report-level review action
- original-versus-corrected comparison panel
- failed-record emphasis treatment

Exit criteria:
- unreviewed, failed, and comparison-heavy screens feel correct, not approximate
- payload generation still matches backend review contract

## Phase 7: Stream And Progress Fidelity

Goal:
- make processing and state transitions believable

Tasks:
- refine stream-applied updates
- refine progress presentation
- ensure processing-to-ready flow stays semantically correct

Exit criteria:
- fixture stream events can drive visually plausible transitions

## Phase 8: Copy And Interaction Polish

Goal:
- remove remaining drift and rough edges

Tasks:
- audit all copy against approved tone
- remove any leftover generic dev/process text
- ensure action labels stay backend-truthful
- ensure status treatments are consistent

Exit criteria:
- no obvious fake-product copy remains

## Phase 9: Test Hardening

Goal:
- lock in the implementation shape so it survives iteration

Tasks:
- route tests for all review harness screens
- component tests for record card and review controls
- view-model tests where formatting/derivation matters
- fixture/client tests where scenario coverage matters

Exit criteria:
- regressions in status rendering, route rendering, and review payload shape are caught automatically

## Phase 10: Backend Activation Readiness

Goal:
- be ready to switch from fixture-only to real backend data when venue/auth context exists

Tasks:
- keep all reports views consuming the client boundary
- avoid direct fixture imports from page components
- document the exact gate for turning on backend calls

Exit criteria:
- the remaining backend work is wiring, not redesign

## Definition Of Success

The work is successful when:
- the app looks like the golden set
- the semantics follow backend truth
- the code is organized well enough to continue without another architectural reset
- the team can review real routes locally without needing design-tool archaeology
