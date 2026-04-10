# Dashboard Testing Strategy

## Purpose

Define the minimum testing strategy for the dashboard MVP before implementation starts.

The goal is not to maximize test count. The goal is to give the team confidence that:

- fixture-backed UI review is trustworthy
- critical user flows do not regress silently
- core dashboard logic is covered by fast automated checks
- the team is not relying only on manual review at the end

## Current Reality

Today, `bun test` is not meaningful dashboard coverage.

At the moment, the workspace test run only covers the existing UI package test and does not verify dashboard-specific behavior.

That means dashboard implementation should add dashboard-focused tests intentionally rather than assuming the current workspace test command is enough on its own.

## Testing Layers

The dashboard MVP should use four layers of confidence:

1. Static validation
2. Fast automated dashboard tests
3. Fixture-backed localhost review
4. Final browser-level critical-flow verification

## Layer 1: Static Validation

Required on meaningful implementation phases:

- `bun --filter @bartools/dashboard lint`
- `bun --filter @bartools/dashboard build`
- `bun test`

Purpose:

- catch syntax, type, and packaging issues early
- keep the dashboard shippable as the architecture changes

Note:

- `bun test` should continue to run at the workspace level
- dashboard-specific automated tests should be added so this command becomes more meaningful over time

## Layer 2: Fast Automated Dashboard Tests

Recommended tooling once implementation begins:

- `Vitest` for unit and integration tests
- `@testing-library/react` for component and route behavior
- `@testing-library/user-event` for interaction testing where useful

Purpose:

- verify behavior without requiring a running browser session
- keep feedback fast enough to use during slice-by-slice development

## What Should Be Tested

The MVP should prioritize automated tests for:

- fixture schema validation
- fixture builders for core scenarios
- formatting helpers
- permission helpers
- route protection behavior
- auth/onboarding page behavior
- settings permission behavior
- inventory search, sort, and stale treatment logic
- low-stock view logic tied to PAR behavior
- session detail fallback behavior for missing media
- export behavior that depends on current filters and sort

## What Does Not Need Deep Test Coverage In MVP

Do not spend early implementation time on exhaustive tests for:

- purely visual styling details
- every single fixture scenario as its own automated test
- low-value snapshot churn
- Mantine internals that the dashboard does not customize heavily

The product should be protected where behavior matters, not buried in brittle UI noise.

## Layer 3: Fixture-Backed Localhost Review

Fixture-backed review remains a required part of the plan, not a fallback.

It is the main way to inspect:

- visual hierarchy
- responsive behavior
- state tone
- manager versus non-manager differences
- onboarding create versus join flows
- session media states

This layer is especially important while backend contracts are still moving.

## Layer 4: Browser-Level Critical-Flow Verification

Before MVP release, the team should run browser-level checks for the highest-risk flows:

- sign in
- sign up to onboarding
- create-bar onboarding
- join-bar onboarding
- settings manager flow
- inventory default flow
- low-stock flow
- session history to session detail flow

Minimum requirement:

- run a repeatable browser verification pass against fixture-backed routes on localhost
- record pass/fail results in a written checklist attached to the implementation checkpoint, PR, or handoff
- do not mark the final polish phase complete without that artifact

Recommended tooling:

- Playwright for browser-driven verification once the dashboard foundation is stable

Allowed MVP fallback:

- If full browser automation is not in place yet, run the same required checklist manually in a real browser and record the result explicitly

## Minimum Test Bar By Phase

### Phase 0: Foundation

Required:

- lint
- build

Recommended:

- no major automated dashboard test investment yet beyond bootstrapping the test runner if convenient

### Phase 1: Fixture Review Harness

Required:

- fixture schema tests
- fixture builder tests for core entities

Done means:

- broken fixtures fail loudly
- review scenarios are structurally trustworthy

### Phase 2: Shell And Styling

Required:

- lightweight route-render tests for public shell and authenticated shell
- permission-limited state rendering where shared state components are involved

Done means:

- the app shell renders intentionally in test and in fixture review

### Phase 3: Public And Auth Flows

Required:

- sign-in route behavior
- sign-up to onboarding transition
- password reset state handling
- onboarding create/join path branching
- route protection behavior

Done means:

- account-entry flow is behaviorally protected before backend integration

### Phase 4: Settings And Access

Required:

- manager versus non-manager rendering behavior
- settings edit availability
- invite-link generation UI behavior
- manager-grant action visibility and state handling
- manager-only invite access behavior

Done means:

- access rules are not enforced only by visual luck

### Phase 5: Inventory

Required:

- inventory route render
- search behavior
- sort behavior
- latest-confirmed aggregate messaging
- confirmed-only aggregation behavior
- comparable-unit display and comparison behavior
- stale treatment logic
- empty/loading/error state handling

Done means:

- the default signed-in operational page is behaviorally stable

### Phase 6: Low Stock

Required:

- below-par route render
- queue ordering behavior
- confirmed-only low-stock derivation behavior
- comparable-unit-driven low-stock behavior
- empty/loading/error state handling

Done means:

- the focused queue behaves as intended and does not drift from inventory assumptions

### Phase 7: Sessions

Required:

- session history render
- session detail render
- original-versus-corrected display logic
- missing-media fallback behavior

Done means:

- auditability behavior is protected, not only visually reviewed

### Phase 8: CSV Export

Required:

- inventory export behavior against current filters and sort
- low-stock export behavior against current filters and sort
- timestamp formatting checks in bar-local timezone
- required-column verification by export type

Done means:

- exports are tested as behavior, not assumed from UI wiring

### Phase 9: Backend Integration Hardening

Required:

- keep existing dashboard tests passing
- add or adjust tests where fixture behavior and live behavior diverge materially

Done means:

- integration does not silently break dashboard expectations established in fixture mode

### Phase 10: Final Polish

Required:

- final regression checklist across manager and non-manager flows
- browser-level verification of critical paths with a recorded pass/fail artifact

Done means:

- the MVP has both automated behavioral protection and end-to-end visual verification

## Working Agreement

When implementation begins:

1. Add dashboard-specific test tooling early, not at the end
2. Start with fixture schema and helper tests
3. Add route and behavior tests as each feature phase lands
4. Keep tests focused on product behavior and access rules
5. Use fixture-backed review and automated tests together, not as substitutes for each other

## Definition Of Success

The testing strategy is successful if:

- dashboard behavior is covered where regressions would hurt users
- fixture review remains trustworthy
- critical flows are verifiable before backend completion
- final release confidence does not depend on memory or manual luck
