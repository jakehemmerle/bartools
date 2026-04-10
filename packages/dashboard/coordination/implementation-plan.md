# Dashboard Implementation Plan

## Purpose

Define the step-by-step implementation plan for the dashboard MVP described in this spec set.

This document exists to:

- sequence the work into reviewable phases
- identify dependencies and risks before implementation begins
- define how we will inspect real UI output as the dashboard evolves

## Planning Assumptions

- The approved dashboard specs in this folder are the product source of truth
- Dashboard implementation remains web-first and local to `packages/dashboard`
- No major reshaping of `packages/ui` happens as part of this dashboard MVP plan unless the team explicitly decides otherwise
- During MVP, `packages/dashboard` does not import rendered UI components from `@bartools/ui`
- `packages/ui` may remain mobile-oriented for rendered components during MVP
- Backend contracts may evolve, but the dashboard should be buildable against fixtures before backend integration is complete
- The dashboard must remain reviewable throughout development, not only at the end

## Current Baseline

Today, the dashboard app is still a starter app and imports UI from the shared React Native-oriented package.

That coupling is the source of the current build problem. The dashboard should not solve it by leaning harder on a React Native web bridge. It should solve it by moving rendered web UI into `packages/dashboard`.

That means the first implementation phase is not feature work. It is foundation work:

- remove web reliance on React Native-oriented UI primitives
- stop importing rendered components from `@bartools/ui` in dashboard routes
- introduce Mantine and app structure
- create a reviewable, web-native baseline

## Phase Ordering

The implementation order should be:

1. Foundation
2. Review harness and fixture mode
3. Public/auth flows
4. Settings and access management
5. Inventory
6. Low Stock
7. Sessions
8. CSV export
9. Backend integration hardening
10. Final polish

This order is intentional:

- Settings must land before Low Stock is truly meaningful because PAR drives `below par`
- Fixture-backed review must land early so product and design can be inspected before backend work is ready
- Inventory should arrive before Low Stock because Low Stock is a focused derivative view of product-level inventory

## Proposed Code Organization

The dashboard code should likely grow around feature boundaries rather than one large `App.tsx`.

Suggested structure:

```text
packages/dashboard/src/
  app/
    providers/
    router/
    shell/
    theme/
  features/
    auth/
    onboarding/
    settings/
    inventory/
    low-stock/
    sessions/
    export/
  components/
    layout/
    states/
    table/
  lib/
    api/
    fixtures/
    formatting/
    permissions/
```

This is guidance, not a rigid requirement, but the plan assumes we do not keep all feature logic in top-level starter files.

## Phase 0: Foundation Reset

### Goal

Establish a web-native dashboard foundation.

### Tasks

- Remove dashboard page dependence on `@bartools/ui` components
- Replace starter `@bartools/ui` usage in `App.tsx` with dashboard-local web UI
- Install and wire Mantine
- Add app providers and theme setup
- Add routing
- Replace starter content with dashboard-local app shell scaffolding
- Remove `vite-plugin-react-native-web` from the dashboard once it is no longer needed
- Remove `react-native-web` from the dashboard once no dashboard-rendered UI depends on it
- Ensure the dashboard can lint and build cleanly from its own web-native foundation

### Deliverables

- A running web app using Mantine providers
- A minimal route structure
- A dashboard-local button/input/layout layer where needed
- No user-facing route still depending on rendered components from `@bartools/ui`
- No dashboard-specific dependence on the React Native web bridge for rendered UI

### Risks

- Web build issues caused by current `react-native` dependency paths
- Over-coupling the dashboard to mobile abstractions before web architecture is stable

### Exit Criteria

- `bun --filter @bartools/dashboard lint` passes
- `bun --filter @bartools/dashboard build` passes
- The app boots into a dashboard-local shell without starter demo UI
- Dashboard routes no longer depend on rendered UI from `@bartools/ui`

## Phase 1: Review Harness And Fixture Mode

### Goal

Make the dashboard inspectable before backend integration is finished.

Implementation assumption:

- Phase 1 uses local fixtures as the primary review mechanism
- A mock server is optional later, not required to begin dashboard implementation

### Tasks

- Add fixture data for all MVP surfaces
- Add a development mode that can render stable review states
- Add stable routes for key screens
- Add explicit empty, error, stale, permission-limited, and missing-media states
- Add schema-validated fixtures so review scenarios stay aligned with dashboard-facing contracts

### Deliverables

- Fixture-backed routes for:
  - landing
  - sign in
  - sign up
  - password reset
  - onboarding create
  - onboarding join
  - inventory
  - low stock
  - sessions
  - settings
- Stable sample data for manager and non-manager users
- A validated fixture layer suitable for repeated review and feedback

### Exit Criteria

- Product and design review can happen on localhost without waiting for backend completion

## Phase 2: App Shell And Styling Foundation

### Goal

Implement the visual system and shells defined by the spec set.

### Tasks

- Build the public shell for marketing/auth pages
- Build the authenticated shell for dashboard routes
- Implement theme tokens
- Implement layout primitives
- Implement shared empty/loading/error/stale presentation patterns

### Deliverables

- Public shell
- Authenticated shell
- Theme token definitions
- Reusable state components

### Exit Criteria

- The dashboard visibly matches the approved “operational utility with a little polish” direction
- The UI no longer looks like a starter app or default library demo

## Phase 3: Public And Auth Flows

### Goal

Ship the entry flow into the product.

### Tasks

- Landing page
- Sign in
- Sign up
- Password reset request
- Password reset completion
- Post-signup onboarding create path
- Post-signup onboarding join path
- Use fixture-generated invite links for the join path until real invite generation lands in Settings

### Deliverables

- A coherent self-serve account flow
- Invite-link consumption path in onboarding
- Correct routing between signed-out and signed-in surfaces

### Exit Criteria

- A first-time user can move from landing to onboarding clearly
- An existing user can sign in and reset password

## Phase 4: Settings And Access

### Goal

Ship the minimum configuration needed to make operational views meaningful.

### Tasks

- Bar timezone settings
- Default PAR setting in the backend-provided comparable unit
- Product PAR override table
- Invite-link generation for managers
- `canManageBar` gating
- Grant-manager capability flow for existing members

### Deliverables

- A functional `Settings` route
- Clear manager and non-manager states
- Product PAR override workflow

### Exit Criteria

- A manager can configure bar settings and product PAR overrides
- A non-manager sees an intentional restricted state

## Phase 5: Inventory

### Goal

Ship the main signed-in operational surface.

### Tasks

- Latest-confirmed product-level inventory table
- Search by product name
- Filter by below-par status
- Sort by product name
- Sort by on-hand quantity
- Sort by `as of` date
- Communicate that rows may come from different confirmed sessions and different dates
- Use only confirmed session-derived data in the aggregate inventory view
- Use backend-provided comparable-unit values rather than inventing dashboard-side comparison math
- Subtle stale treatment after 14 days
- Export entry point

### Deliverables

- A usable default signed-in homepage
- Product-level terminology throughout the page
- Clear latest-confirmed aggregate messaging in the page UI
- Responsive layouts across desktop, tablet, and phone web

### Exit Criteria

- Inventory is useful and reviewable as a standalone MVP screen
- The page does not imply a single-session snapshot or live stock guarantee

## Phase 6: Low Stock

### Goal

Ship the focused `Below Par` view.

### Tasks

- Build the focused low-stock list
- Present below-par reasons clearly
- Communicate that low-stock status derives from latest confirmed per-product counts
- Respect backend-provided comparable-unit values for product comparison logic
- Use only confirmed session-derived data in low-stock calculations
- Preserve sort/filter behavior appropriate to the page
- Add export entry point

### Deliverables

- A low-stock workflow that clearly derives from configured PAR values
- A low-stock workflow that remains honest about mixed recency and latest-confirmed provenance

### Exit Criteria

- A manager can quickly identify what needs attention and why
- The page does not imply a single-session snapshot or live stock guarantee

## Phase 7: Sessions

### Goal

Ship session history and auditability.

### Tasks

- Session history list
- Session detail page
- Thumbnail display
- Missing-media fallback
- Original-versus-corrected comparison UI when data exists

### Deliverables

- A session history route
- A session detail route
- Graceful handling of missing or expired images

### Exit Criteria

- A user can inspect a completed session without confusion

## Phase 8: CSV Export

### Goal

Ship exports across the operational surfaces.

### Tasks

- Inventory export
- Low-stock export
- Defer session export from MVP implementation unless the team explicitly re-promotes it later
- Preserve current filter and sort definitions in export behavior
- Format timestamps in bar-local timezone

### Deliverables

- CSV export actions on supported surfaces
- Context-appropriate required and optional columns per export type

### Exit Criteria

- Exported data matches the user-visible view definition

## Phase 9: Backend Integration Hardening

### Goal

Replace fixtures progressively with real data and stabilize the dashboard.

### Tasks

- Wire real backend resources to auth
- Wire settings
- Wire inventory
- Wire low stock
- Wire sessions
- Decide where client-side export remains acceptable versus where backend export is needed
- Verify permission and invite flows against real data
- Verify that only confirmed session data influences inventory and low-stock views
- Verify that comparable-unit values arrive consistently from backend without dashboard-side math invention

### Deliverables

- Real data integration across MVP routes
- Stable error handling for partial or missing backend data
- Verified alignment between backend inventory semantics and dashboard latest-confirmed messaging

### Exit Criteria

- MVP flows work against real backend data without breaking spec expectations

## Phase 10: Final Polish

### Goal

Harden quality after feature completeness.

### Tasks

- Accessibility pass
- Responsive pass
- Visual polish pass
- Copy and state-tone consistency pass
- Regression pass across manager and non-manager flows

### Exit Criteria

- The implemented dashboard still reflects the approved spec set after real integration

## Introspection Workflow

## Goal

Give the implementation process a repeatable way to inspect real UI output and catch drift early.

### Requirements

- The dashboard must run locally on a stable URL
- Key routes must exist even when backed by fixtures
- Core product states must be intentionally renderable in development

### Chosen Initial Approach

- Use fixtures as the default introspection mechanism
- Do not block dashboard progress on backend readiness
- Introduce a mock server only if fixture-based iteration becomes too limiting during implementation

### Reviewable Routes

- `/`
- `/sign-in`
- `/sign-up`
- `/reset-password`
- `/onboarding/create`
- `/onboarding/join`
- `/inventory`
- `/low-stock`
- `/sessions`
- `/sessions/:id`
- `/settings`

### Reviewable States

- Manager user
- Non-manager user
- Settings member list
- Settings manager-grant flow
- Empty inventory
- Stale inventory
- Below-par inventory
- Session with thumbnails
- Session with missing thumbnails
- Onboarding create flow
- Onboarding join flow

### Review Loop

1. Complete one implementation slice
2. Run the dashboard locally
3. Inspect key routes and states in the browser
4. Compare actual UI against the approved specs
5. Tighten the slice before moving to the next phase

This loop should be used throughout the build rather than saved for the end.

## Validation Gates

Each meaningful implementation phase should be validated with:

- `bun --filter @bartools/dashboard lint`
- `bun --filter @bartools/dashboard build`
- `bun test`

If a known baseline issue prevents a gate from passing, that issue must be called out explicitly before the phase is considered complete.

Testing expectations beyond these baseline gates are defined in [testing-strategy.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/testing-strategy.md).

## Immediate Next Planning Step

Before coding starts, the next implementation-aligned planning step should be:

1. Confirm this phased plan with the team
2. Confirm that the written specs in this folder are sufficient UI and behavior guidance for implementation
3. Use [ticket-backlog.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/ticket-backlog.md) as the starting point for ticket-sized implementation work

## Recommended Starting Point Once Implementation Begins

Start with Phase 0 and Phase 1 together.

That gives the project:

- a web-native foundation
- reviewable localhost routes
- a practical introspection loop

Those two things will reduce risk for every later feature phase.
