# Phase 1-2 File Checklist

This document makes the first implementation passes painfully explicit.

It focuses on:
- Phase 1: design token and shell refactor
- Phase 2: review harness and scenario routing

The point is to reduce planning drift once coding starts.

## Current Files Likely To Change Immediately

### Existing Files

- `src/app/router.tsx`
- `src/app/theme.ts`
- `src/index.css`
- `src/app/providers.tsx`
- `src/components/layout/public-shell.tsx`
- `src/components/layout/authenticated-shell.tsx`
- `src/pages/reports-page.tsx`
- `src/lib/reports/client.ts`
- `src/lib/reports/provider.tsx`

### Existing Files Likely To Be Replaced Or Wrapped

- `src/app/theme.ts`
  Treat this as a migration source only. The canonical target is split theme files under `src/app/theme/`.

- `src/components/layout/public-shell.tsx`
  Treat this as a migration source only. The canonical target is `src/components/shell/public/public-shell.tsx`.

- `src/components/layout/authenticated-shell.tsx`
  Treat this as a migration source only. The canonical target is `src/components/shell/workbench/workbench-shell.tsx`.

- `src/pages/reports-page.tsx`
  Current file likely becomes a compatibility wrapper or gets broken apart.

- `src/components/states/state-panel.tsx`
  Keep only if it can survive BARTOOLS styling. Otherwise replace with more specific state components.

## Phase 1: Design Token And Shell Refactor

## Objective

Make `/` and `/reports` feel like the same BARTOOLS product family before deeper feature work.

## 1. Theme And Token Files

### `src/app/theme/tokens.ts`

Phase 1 action:
- define the locked BARTOOLS surface, text, accent, spacing, radius, border, and shadow tokens
- implement the values from `visual-token-spec.md`

### `src/app/theme/typography.ts`

Phase 1 action:
- map `Newsreader`, `Manrope`, and `Space Grotesk` into the canonical type roles
- export stable typography helpers or token objects

### `src/app/theme/semantic-colors.ts`

Phase 1 action:
- expose semantic mappings for status and surface usage without re-inventing raw colors in components

Migration note:
- stop importing `src/app/theme.ts`
- remove or replace it once callers use the split theme files

### `src/app/providers.tsx`

Current role:
- Mantine provider root plus notifications

Phase 1 action:
- remove Mantine app-root dependency
- keep only the providers we actually need
- ensure React Aria usage does not reintroduce a heavy framework-shaped provider stack

### `src/index.css`

Current role:
- minimal global reset

Phase 1 action:
- add app-level CSS variables for the locked token system
- add body background rules aligned with dark-first product family
- add root typography and smoothing rules
- add utility classes only if they are stable and product-specific

Must not become:
- a random dumping ground for one-off page fixes

## 2. Shell Files

### `src/components/shell/public/public-shell.tsx`

Phase 1 action:
- build the canonical public shell around the approved entry composition
- keep it narrowly responsible for the entry-family surface

### `src/components/shell/public/public-top-bar.tsx`

Phase 1 action:
- own the public BARTOOLS wordmark treatment
- keep CTA framing restrained if the top bar needs an action at all

### `src/components/shell/workbench/workbench-shell.tsx`

Phase 1 action:
- replace sidebar-oriented shell assumptions with the canonical top-bar workbench shell
- establish dark canvas, page gutters, and route-family consistency

### `src/components/shell/workbench/workbench-top-bar.tsx`

Phase 1 action:
- own the detail/list workbench header treatment
- support back action plus centered wordmark composition where required

### `src/components/shell/workbench/workbench-canvas.tsx`

Phase 1 action:
- own max width, vertical rhythm, and shared content alignment

Migration note:
- legacy files under `src/components/layout/` should become wrappers or be removed once the canonical shell files are live

## 3. Primitive Files To Add In Phase 1

### `src/components/primitives/app-wordmark.tsx`

Why:
- header identity is repeated

### `src/components/primitives/status-chip.tsx`

Why:
- list and detail screens both depend on status presentation

### `src/components/primitives/section-eyebrow.tsx`

Why:
- approved screens repeat a specific uppercase label rhythm

### `src/components/primitives/surface-card.tsx`

Why:
- reduces repeated panel styling drift

### `src/components/primitives/button.tsx`

Why:
- we should own visible button styling early instead of inheriting framework defaults

### `src/components/primitives/select.tsx`

Why:
- product match is a core interaction and should be implemented on primitives we control

## 4. Entry Screen File

### Add `src/features/reports/components/entry-screen.tsx`

Why:
- entry page should stop living implicitly inside generic auth page content

Responsibilities:
- page copy
- hero hierarchy
- CTA placement

### Update route integration

`src/app/router.tsx` should point `/` at the new entry-screen component inside the public shell.

## 5. Reports List Scaffold Files

### Add `src/features/reports/components/reports-list-screen.tsx`

Responsibilities:
- top-level list page structure
- loading/empty/populated branching

### Add `src/features/reports/components/reports-empty-screen.tsx`

Responsibilities:
- dedicated empty-state layout

### Add `src/features/reports/components/reports-list-row.tsx`

Responsibilities:
- single report row/card

### Add `src/features/reports/view-models/report-list-view.ts`

Responsibilities:
- convert `ReportListItem` into screen-ready display data

## Phase 1 Completion Checklist

- `/` looks like BARTOOLS entry surface, not generic auth shell
- `/reports` looks like the same product family
- shell no longer depends on sidebar-heavy layout assumptions
- status styling is centralized
- list page rendering is no longer trapped in one generic page file
- the app root no longer depends on Mantine
- canonical shell and theme file locations are in use

## Phase 2: Review Harness And Scenario Routing

## Objective

Make every approved screen accessible as a stable local route.

## 1. Scenario Source Files

### Add `src/features/reports/fixtures/review-scenarios.ts`

Responsibilities:
- define named screen scenarios matching the golden set

Suggested exports:
- `entryScenario`
- `reportsListScenario`
- `reportsEmptyScenario`
- `reportCreatedScenario`
- `reportProcessingScenario`
- `reportUnreviewedScenario`
- `reportReviewedScenario`
- `reportComparisonScenario`
- `reportFailedScenario`
- `reportBlockedScenario`
- `reportNotFoundScenario`

### Optional add `src/features/reports/fixtures/review-scenario-map.ts`

Use if route mapping or metadata becomes non-trivial.

## 2. Review Route Files

### Add route files

- `src/features/reports/routes/review-entry-route.tsx`
- `src/features/reports/routes/review-reports-list-route.tsx`
- `src/features/reports/routes/review-reports-empty-route.tsx`
- `src/features/reports/routes/review-report-created-route.tsx`
- `src/features/reports/routes/review-report-processing-route.tsx`
- `src/features/reports/routes/review-report-unreviewed-route.tsx`
- `src/features/reports/routes/review-report-reviewed-route.tsx`
- `src/features/reports/routes/review-report-comparison-route.tsx`
- `src/features/reports/routes/review-report-failed-route.tsx`
- `src/features/reports/routes/review-report-blocked-route.tsx`
- `src/features/reports/routes/review-report-not-found-route.tsx`

Responsibilities:
- read a fixed scenario
- render the proper screen component
- avoid bespoke styling logic

## 3. Router Updates

### `src/app/router.tsx`

Phase 2 action:
- add review harness routes
- keep them grouped and obvious
- keep real app routes clean

Suggested path group:
- `/__review/...`

Important:
- do not mix review harness branching into production route components more than necessary

## 4. Detail Screen Files To Add In Phase 2

### Add `src/features/reports/components/report-detail-screen.tsx`

Responsibilities:
- top-level detail state branching

### Add `src/features/reports/components/report-header.tsx`

Responsibilities:
- report title/id
- status
- metadata slot

### Add `src/features/reports/components/report-blocked-screen.tsx`

Responsibilities:
- blocked state screen

### Add `src/features/reports/components/report-not-found-screen.tsx`

Responsibilities:
- not-found state screen

### Add `src/features/reports/components/report-progress-panel.tsx`

Responsibilities:
- processing-state presentation

### Add `src/features/reports/view-models/report-detail-view.ts`

Responsibilities:
- derive screen-ready detail data
- keep formatting and state derivation out of JSX

## 5. Client And Provider Files

### `src/lib/reports/client.ts`

Phase 2 action:
- preserve client boundary
- ensure fixture scenarios can still align with route-level review states
- avoid page components importing raw historical fixtures directly

Possible additions:
- scenario helper exports if they help harness setup

### `src/lib/reports/provider.tsx`

Phase 2 action:
- probably minimal changes
- only expand if review harness needs scoped client injection

## 5.5 Package And Entry Files

### `packages/dashboard/package.json`

Phase 1 action:
- remove Mantine dependencies
- add React Aria dependencies

### `src/main.tsx`

Phase 1 action:
- remove Mantine stylesheet imports
- ensure app boot still stays minimal and explicit

## 6. Test Files To Add In Phase 2

### `src/app/review-router.test.tsx`

Purpose:
- verify review routes render expected screens

### `src/features/reports/routes/*.test.tsx`

Purpose:
- verify screen-state route wiring where useful

### `src/features/reports/fixtures/review-scenarios.test.ts`

Purpose:
- ensure all named scenarios are structurally valid

## Phase 2 Completion Checklist

- every approved screen has a stable local review route
- blocked and not-found states are explicit routes, not just fallback accidents
- real routes remain clean
- screen components are beginning to replace page-local generic rendering

## Recommended Order Inside Phase 1 And 2

1. refactor theme
2. refactor shells
3. add primitives
4. extract entry and list screens
5. add scenario files
6. add review routes
7. extract detail-shell components
8. add tests for review routing

## Definition Of Ready For Real UI Build

We are ready to start the full screen implementation pass when:
- shell and tokens are stable enough to stop changing every route
- list and detail screens each have their own feature-owned files
- review harness routes exist
- the app can render every approved screen from deterministic local state
- the interaction primitive layer is no longer tied to Mantine
- the canonical file layout is in use rather than half-legacy, half-target paths
