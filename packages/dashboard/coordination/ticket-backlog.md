# Dashboard Ticket Backlog

## Purpose

Turn the implementation plan into ticket-sized units of work that are small enough to assign, estimate, and review.

This document is intentionally pragmatic:

- each ticket should produce a reviewable change
- each ticket should have clear dependencies
- each ticket should point back to the spec source of truth

These are suggested ticket boundaries, not a mandate that the team must use this exact tracker structure.

## How To Use This Backlog

- Copy one ticket at a time into the team tracker
- Keep implementation aligned to the spec files named in each ticket
- Do not merge tickets just because they are adjacent if doing so weakens reviewability
- Split a ticket further if real implementation reveals hidden complexity

## Ticket Format

Each ticket includes:

- `Title`
- `Outcome`
- `Depends on`
- `Spec anchors`
- `Validation`

## Foundation And Review Harness

### DASH-001: Audit Dashboard Foundation Dependencies

Outcome:

- Identify all current `@bartools/ui` imports used by dashboard code
- Confirm which dashboard dependencies are temporary RN-web bridge dependencies
- Confirm the minimum dependency set needed for the web-native reset

Depends on:

- none

Spec anchors:

- [README.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/README.md)
- [implementation-plan.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/implementation-plan.md)
- [phase-0-1-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-0-1-breakdown.md)

Validation:

- dependency list is written down in the ticket or PR description
- all dashboard `@bartools/ui` rendered-component imports are identified

### DASH-002: Replace Starter Root App Structure

Outcome:

- Replace starter `App.tsx` flow with app-level providers and route entry structure

Depends on:

- `DASH-001`

Spec anchors:

- [implementation-plan.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/implementation-plan.md)
- [phase-0-1-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-0-1-breakdown.md)

Validation:

- `main.tsx` renders a real app structure
- starter demo wiring is gone

### DASH-003: Remove RN-Oriented Rendered UI From Dashboard Routes

Outcome:

- Stop importing rendered components from `@bartools/ui` in dashboard page code
- Replace starter button/demo usage with dashboard-local web UI

Depends on:

- `DASH-001`
- `DASH-002`

Spec anchors:

- [README.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/README.md)
- [implementation-plan.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/implementation-plan.md)

Validation:

- no user-facing dashboard route imports rendered UI from `@bartools/ui`
- dashboard page rendering no longer depends on the RN button

### DASH-004: Add Mantine And Web-Native Theme Foundation

Outcome:

- Install Mantine
- Add provider wiring
- Create initial dashboard theme tokens

Depends on:

- `DASH-002`

Spec anchors:

- [styling-and-component-system.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/styling-and-component-system.md)
- [implementation-plan.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/implementation-plan.md)
- [phase-0-1-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-0-1-breakdown.md)

Validation:

- Mantine is wired at the app root
- theme values exist in one clear place

### DASH-005: Add Dashboard Route And Shell Scaffolding

Outcome:

- Add public routes, authenticated routes, and placeholder shells for MVP pages

Depends on:

- `DASH-002`
- `DASH-004`

Spec anchors:

- [implementation-plan.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/implementation-plan.md)
- [mvp-overview.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/mvp-overview.md)

Validation:

- MVP routes exist as stable entry points
- public and authenticated surfaces are structurally separated

### DASH-006: Remove Dashboard RN-Web Bridge Dependencies

Outcome:

- Remove `vite-plugin-react-native-web` and `react-native-web` from dashboard once they are no longer needed

Depends on:

- `DASH-003`
- `DASH-005`

Spec anchors:

- [README.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/README.md)
- [phase-0-1-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-0-1-breakdown.md)

Validation:

- `bun --filter @bartools/dashboard build` passes without RN-web bridge tooling

### DASH-007: Establish Fixture Architecture And Zod Validation

Outcome:

- Define fixture layout, scenario naming, and Zod-validated fixture schemas for core entities

Depends on:

- `DASH-005`

Spec anchors:

- [fixture-schema-strategy.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/fixture-schema-strategy.md)
- [phase-0-1-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-0-1-breakdown.md)
- [data-contracts.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/data-contracts.md)

Validation:

- shared fixture builders exist
- core fixtures are schema-validated

### DASH-008: Add Stable Fixture Review Routes And Scenarios

Outcome:

- Make all MVP routes reachable in fixture mode with named manager, non-manager, stale, below-par, and missing-media states

Depends on:

- `DASH-007`

Spec anchors:

- [implementation-plan.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/implementation-plan.md)
- [phase-0-1-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-0-1-breakdown.md)

Validation:

- key routes and states can be inspected locally without backend support

## Shell, Auth, And Settings

### DASH-009: Implement Theme Tokens And Shared State Components

Outcome:

- Implement theme tokens plus reusable empty, loading, error, stale, and permission-limited state components

Depends on:

- `DASH-004`
- `DASH-008`

Spec anchors:

- [styling-and-component-system.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/styling-and-component-system.md)
- [phase-2-4-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-2-4-breakdown.md)

Validation:

- shared state patterns are reusable across MVP routes

### DASH-010: Build Public Shell And Landing Page

Outcome:

- Build the signed-out shell and the pure-marketing landing page

Depends on:

- `DASH-009`

Spec anchors:

- [landing-and-auth.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/landing-and-auth.md)
- [phase-2-4-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-2-4-breakdown.md)

Validation:

- first-time users can understand the product and find sign-in/sign-up actions immediately

### DASH-011: Build Sign-In And Route Protection

Outcome:

- Implement sign-in flow and signed-out versus signed-in route behavior

Depends on:

- `DASH-010`

Spec anchors:

- [landing-and-auth.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/landing-and-auth.md)
- [phase-2-4-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-2-4-breakdown.md)

Validation:

- existing users can sign in
- protected routes behave intentionally

### DASH-012: Build Sign-Up And Password Reset Flows

Outcome:

- Implement self-serve sign-up plus password-reset request and completion states

Depends on:

- `DASH-010`

Spec anchors:

- [landing-and-auth.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/landing-and-auth.md)
- [phase-2-4-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-2-4-breakdown.md)

Validation:

- new users can begin onboarding
- existing users have a complete reset path

### DASH-013: Build Onboarding Create-Bar Flow

Outcome:

- Implement create-bar onboarding with bar name, timezone, default PAR, and initial manager assignment

Depends on:

- `DASH-012`

Spec anchors:

- [landing-and-auth.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/landing-and-auth.md)
- [settings.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/settings.md)
- [phase-2-4-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-2-4-breakdown.md)

Validation:

- a new bar can be created with the minimum required configuration

### DASH-014: Build Onboarding Join-Bar Flow

Outcome:

- Implement join-existing-bar onboarding using invite-link consumption and failure states

Depends on:

- `DASH-012`

Spec anchors:

- [landing-and-auth.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/landing-and-auth.md)
- [phase-2-4-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-2-4-breakdown.md)

Validation:

- an additional employee can join an existing bar coherently in fixture mode

### DASH-015: Build Authenticated Shell

Outcome:

- Implement signed-in shell, nav, and responsive layout home for Inventory, Low Stock, Sessions, and Settings

Depends on:

- `DASH-009`

Spec anchors:

- [styling-and-component-system.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/styling-and-component-system.md)
- [phase-2-4-breakdown.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/phase-2-4-breakdown.md)

Validation:

- signed-in routes share a stable responsive shell

### DASH-016: Build Settings Bar Configuration

Outcome:

- Implement timezone editing and default PAR editing using backend-provided comparable-unit semantics

Depends on:

- `DASH-013`
- `DASH-015`

Spec anchors:

- [settings.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/settings.md)
- [data-contracts.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/data-contracts.md)

Validation:

- managers can edit bar-wide settings
- non-managers cannot

### DASH-017: Build Product PAR Override Workflow

Outcome:

- Implement searchable product PAR override table with fallback-to-default behavior

Depends on:

- `DASH-016`

Spec anchors:

- [settings.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/settings.md)
- [low-stock.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/low-stock.md)

Validation:

- managers can configure per-product PAR overrides

### DASH-018: Build Lightweight Team Access Management

Outcome:

- Implement member visibility, manager-only invite-link generation, and manager-grant capability

Depends on:

- `DASH-015`
- `DASH-014`

Spec anchors:

- [settings.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/settings.md)
- [landing-and-auth.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/landing-and-auth.md)

Validation:

- managers can invite and grant manager capability
- non-managers see intentional restricted states

## Operational Views

### DASH-019: Build Latest-Confirmed Inventory Table

Outcome:

- Implement latest-confirmed per-product inventory table with approved columns and product terminology

Depends on:

- `DASH-015`
- `DASH-016`
- `DASH-017`

Spec anchors:

- [inventory.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/inventory.md)
- [data-contracts.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/data-contracts.md)

Validation:

- inventory reflects latest-confirmed aggregate semantics
- only confirmed-session-derived data is assumed

### DASH-020: Add Inventory Search, Sort, And Filter Controls

Outcome:

- Implement search, below-par filter, and supported sorting controls for inventory

Depends on:

- `DASH-019`

Spec anchors:

- [inventory.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/inventory.md)

Validation:

- users can narrow and prioritize the displayed dataset meaningfully

### DASH-021: Add Inventory Freshness And State Treatments

Outcome:

- Implement `as of` dates, mixed-recency note, 14-day stale treatment, and empty/loading/error states

Depends on:

- `DASH-019`
- `DASH-009`

Spec anchors:

- [inventory.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/inventory.md)
- [mvp-overview.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/mvp-overview.md)

Validation:

- inventory stays honest about provenance and recency

### DASH-022: Build Low-Stock View

Outcome:

- Implement below-par queue derived from latest-confirmed per-product counts and PAR settings

Depends on:

- `DASH-017`
- `DASH-019`

Spec anchors:

- [low-stock.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/low-stock.md)
- [inventory.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/inventory.md)

Validation:

- low-stock status is clearly settings-driven and latest-confirmed

### DASH-023: Add Low-Stock Prioritization And States

Outcome:

- Implement low-stock sorting plus empty/loading/error states

Depends on:

- `DASH-022`
- `DASH-009`

Spec anchors:

- [low-stock.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/low-stock.md)

Validation:

- low-stock works as a standalone operational queue

### DASH-024: Build Sessions History

Outcome:

- Implement reverse-chronological session history with status-aware metadata

Depends on:

- `DASH-015`

Spec anchors:

- [sessions.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/sessions.md)
- [data-contracts.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/data-contracts.md)

Validation:

- users can scan past sessions quickly

### DASH-025: Build Session Detail Core View

Outcome:

- Implement session detail metadata and confirmed bottle-record display

Depends on:

- `DASH-024`

Spec anchors:

- [sessions.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/sessions.md)

Validation:

- a completed session can be inspected without confusion

### DASH-026: Add Session Media And Correction Comparison States

Outcome:

- Implement thumbnail display, missing-media fallback, and original-versus-corrected presentation when available

Depends on:

- `DASH-025`

Spec anchors:

- [sessions.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/sessions.md)

Validation:

- media issues do not break session detail
- comparison UI appears only when relevant data exists

## Export, Integration, And Final Hardening

### DASH-027: Build Inventory CSV Export

Outcome:

- Implement inventory export using current filters and sort across all matching rows

Depends on:

- `DASH-020`
- `DASH-021`

Spec anchors:

- [csv-export.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/csv-export.md)
- [inventory.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/inventory.md)

Validation:

- exported inventory data matches the displayed view definition

### DASH-028: Build Low-Stock CSV Export

Outcome:

- Implement low-stock export using current filters and sort across all matching rows

Depends on:

- `DASH-022`
- `DASH-023`

Spec anchors:

- [csv-export.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/csv-export.md)
- [low-stock.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/low-stock.md)

Validation:

- exported low-stock data matches the displayed view definition

### DASH-029: Replace Fixture Auth And Settings With Real Backend Data

Outcome:

- Wire auth, onboarding outcomes, settings, and access behavior to real backend resources

Depends on:

- `DASH-011`
- `DASH-012`
- `DASH-013`
- `DASH-014`
- `DASH-016`
- `DASH-017`
- `DASH-018`

Spec anchors:

- [implementation-plan.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/implementation-plan.md)
- [data-contracts.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/data-contracts.md)

Validation:

- auth, onboarding, settings, and permissions work against real data

### DASH-030: Replace Fixture Inventory And Low-Stock Data With Real Backend Data

Outcome:

- Wire latest-confirmed inventory and low-stock views to real backend data

Depends on:

- `DASH-019`
- `DASH-020`
- `DASH-021`
- `DASH-022`
- `DASH-023`
- `DASH-029`

Spec anchors:

- [inventory.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/inventory.md)
- [low-stock.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/low-stock.md)
- [data-contracts.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/data-contracts.md)

Validation:

- inventory and low-stock semantics stay aligned with the specs against real data

### DASH-031: Replace Fixture Sessions Data With Real Backend Data

Outcome:

- Wire session history and detail to real backend data

Depends on:

- `DASH-024`
- `DASH-025`
- `DASH-026`
- `DASH-029`

Spec anchors:

- [sessions.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/sessions.md)
- [data-contracts.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/data-contracts.md)

Validation:

- sessions remain usable and truthful against real backend data

### DASH-032: Accessibility, Responsive, And Regression Hardening

Outcome:

- Run the final accessibility, responsive, copy-tone, and regression pass across manager and non-manager flows

Depends on:

- `DASH-027`
- `DASH-028`
- `DASH-029`
- `DASH-030`
- `DASH-031`

Spec anchors:

- [testing-strategy.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/testing-strategy.md)
- [styling-and-component-system.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/styling-and-component-system.md)
- [mvp-overview.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/mvp-overview.md)

Validation:

- final polish checks are completed and recorded

## Suggested Initial Sequencing

If the team wants a practical starting queue, the first tickets to pull are:

1. `DASH-001`
2. `DASH-002`
3. `DASH-004`
4. `DASH-003`
5. `DASH-005`
6. `DASH-006`
7. `DASH-007`
8. `DASH-008`

That sequence gets the dashboard onto a web-native foundation and makes the rest of the app reviewable before backend integration.
