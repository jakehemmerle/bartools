# Phase 0 And Phase 1 Breakdown

## Purpose

Break the first two implementation phases into concrete engineering tasks that can be estimated, assigned, and reviewed before coding starts.

These phases are grouped together because they create the foundation and the review loop the rest of the dashboard depends on.

## Phase 0: Foundation Reset

## Objective

Replace the dashboard starter setup with a web-native Mantine foundation that does not depend on React Native-oriented shared UI components.

## Why This Comes First

- The current dashboard still imports UI from the shared React Native-oriented package
- The dashboard needs web-native routing, theming, and layout
- Later feature work will be slower and noisier if we build it on top of the current starter baseline
- The fix is architectural: the dashboard must stop importing rendered UI from `@bartools/ui`, not keep extending a React Native web bridge

## Concrete Tasks

### 0.1 Dependency And Baseline Audit

- Confirm the current dashboard build behavior
- Identify all imports from `@bartools/ui` used by dashboard code
- Decide which dashboard dependencies must be added for the web foundation
- Identify which dashboard dependencies can be removed once RN-oriented rendered UI imports are gone
  Suggested likely additions:
  - Mantine core packages
  - routing library
  - optional TanStack Query if adopted immediately

Done means:

- We know exactly what current starter code must be removed or replaced
- We know the minimum dependency set for the dashboard foundation
- We know which RN-web bridge dependencies are temporary and should be removed from the dashboard

### 0.2 Replace Starter Entry Structure

- Replace the current single-file starter flow in `App.tsx`
- Add app-level providers
- Add root route structure
- Add dashboard-local shell entry points

Done means:

- `main.tsx` renders an app-level provider tree rather than a starter demo
- The dashboard has a clear place for routing, theme, and shell setup

### 0.3 Remove Web Dependence On React Native-Oriented UI

- Stop using `@bartools/ui` components in dashboard pages
- Create dashboard-local web primitives where necessary
- Ensure no user-facing route depends on the shared React Native button
- Treat `packages/ui` as mobile-oriented for rendered components during MVP
- Do not replace one RN-web bridge workaround with another

Done means:

- Dashboard UI renders through web-native components only
- Build risk from React Native UI imports is materially reduced
- Dashboard no longer depends on rendered components from `@bartools/ui`

### 0.4 Add Mantine Theme Foundation

- Install Mantine
- Add provider setup
- Create initial theme tokens
- Establish app-wide typography, spacing, radius, and color defaults

Done means:

- Mantine is wired at the app root
- The dashboard has a theme object and a clear place to evolve it

### 0.5 Add Routing And Shell Scaffolding

- Add public routes
- Add authenticated route grouping
- Add placeholder shell routes for MVP pages
- Add not-found handling if appropriate

Done means:

- MVP route structure exists even if most pages are still placeholders
- Public and authenticated surfaces are separated structurally

### 0.6 Foundation Validation

- Lint dashboard
- Build dashboard
- Confirm the app boots locally without starter demo UI
- Confirm RN-web bridge dependencies are removed from the dashboard when no longer needed

Done means:

- `bun --filter @bartools/dashboard lint` passes
- `bun --filter @bartools/dashboard build` passes
- The dashboard shell runs locally
- The dashboard build no longer relies on `vite-plugin-react-native-web` for rendered UI

## Phase 0 Suggested Sequence

1. Audit imports and dependencies
2. Add Mantine and routing dependencies
3. Replace root entry structure
4. Remove `@bartools/ui` page usage
5. Add Mantine provider and theme
6. Add route scaffolding
7. Validate build and lint

## Phase 0 Risks

- Web build failures caused by current `react-native` dependency resolution
- Prematurely reintroducing shared UI abstractions before the dashboard shell is stable
- Quietly keeping the dashboard coupled to mobile UI through bridging dependencies after the starter code is gone

## Phase 1: Fixture-Based Review Harness

## Objective

Make the dashboard reviewable on localhost before backend integration is ready.

## Why This Comes Second

- Product review should not wait on unstable backend contracts
- The dashboard needs intentional states for design and UX review
- Fixtures create a repeatable introspection loop

## Concrete Tasks

### 1.1 Fixture Strategy

- Choose where fixtures live in the dashboard source tree
- Define a simple way to switch the app into fixture mode
- Keep the fixture mechanism small and easy to remove or bypass later
- Plan to validate fixture shapes with Zod so scenarios do not silently drift

Done means:

- The team agrees on a fixture pattern that does not overcomplicate the app

### 1.2 Route-Level Fixture Coverage

- Create fixture-backed versions of:
  - landing
  - sign in
  - sign up
  - password reset
  - onboarding create path
  - onboarding join path
  - inventory
  - low stock
  - sessions
  - settings

Done means:

- Every MVP route can render in development without backend dependencies

### 1.3 State Coverage

- Add fixture scenarios for:
  - manager user
  - non-manager user
  - empty inventory
  - stale inventory
  - below-par inventory
  - session with thumbnails
  - session with missing images
  - join flow using invite link

Done means:

- Core UX states are inspectable intentionally, not only when they happen by chance

### 1.4 Shared Fixture Utilities

- Add fixture helpers for:
  - users
  - bar settings
  - product inventory rows
  - session list items
  - session detail records
- Add Zod schemas for core fixture entities and scenarios

Done means:

- Fixtures are reusable and not duplicated ad hoc across screens
- Fixture data is structurally validated against dashboard-facing expectations

### 1.5 Review Route Stability

- Keep stable route paths for repeated inspection
- Ensure feature pages can be reached directly in development
- Avoid hiding key states behind brittle manual setup steps

Done means:

- Reviewers can reliably revisit the same routes and states across iterations

### 1.6 Review Harness Validation

- Confirm local dashboard review works with fixtures
- Confirm key states are reachable
- Confirm state transitions do not require backend support

Done means:

- Product and design review can proceed on localhost without backend readiness

## Phase 1 Suggested Sequence

1. Choose fixture-switching approach
2. Create shared fixture models and Zod schemas
3. Add fixture-backed routes
4. Add named state scenarios
5. Verify route stability for review
6. Run review pass on localhost

## Recommended Review States To Prioritize

- Inventory default
- Inventory empty
- Inventory stale
- Low stock default
- Sessions default
- Session detail with image
- Session detail missing image
- Settings as manager
- Settings as non-manager
- Settings with member list
- Settings with manager-grant action
- Onboarding create
- Onboarding join

## Combined Exit Criteria For Phase 0 And Phase 1

- The dashboard uses a web-native Mantine foundation
- The dashboard no longer depends on React Native-oriented shared UI for page rendering
- MVP route scaffolding exists
- Fixture mode can render core product routes and states
- Fixture scenarios are validated and stable enough for repeated review
- The dashboard is reviewable on localhost without backend dependencies

## Suggested Validation Gates

- `bun --filter @bartools/dashboard lint`
- `bun --filter @bartools/dashboard build`
- `bun test`

## Suggested Immediate Task List

If the team wants a ready-to-start checklist, the first implementation work should likely be:

1. Add Mantine and routing dependencies to the dashboard
2. Replace starter `App.tsx` structure with app providers and routing
3. Remove dashboard page usage of `@bartools/ui`
4. Remove `vite-plugin-react-native-web` and `react-native-web` from the dashboard when no longer needed
5. Create theme and shell scaffolding
6. Create fixture directory, Zod schemas, and fixture-switching approach
7. Add fixture-backed placeholder routes for all MVP surfaces
8. Validate lint, build, and localhost review
