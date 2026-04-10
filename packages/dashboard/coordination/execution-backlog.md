# Execution Backlog

## Purpose

Translate the phase breakdowns into execution-ready work slices that are easier to estimate, assign, and review.

This is still a planning artifact, not a commitment to exact ticket boundaries.

## How To Use This Backlog

- Treat each slice as a reviewable unit of work
- Prefer finishing a slice fully rather than spreading effort across many slices
- Keep visual review and state review attached to each slice
- Do not move on from one slice until its exit criteria are met

## Workstream A: Foundation

### Slice A1: Dependency Reset

Scope:

- Audit current dashboard dependencies
- Identify all `@bartools/ui` usage in dashboard code
- Define the initial web-native dependency set
- Identify which RN-web bridge dependencies should be removed from the dashboard once rendered UI imports are gone

Deliverable:

- A concrete dependency change list for dashboard foundation work

Exit criteria:

- The team knows exactly what must change before web-native work can proceed
- The team knows which dashboard dependencies are temporary bridge dependencies versus real long-term web dependencies

### Slice A2: Root App Structure

Scope:

- Replace starter `App.tsx` flow
- Add provider tree
- Add routing entry point

Deliverable:

- Dashboard-local root structure instead of starter demo wiring

Exit criteria:

- `main.tsx` renders a real app structure

### Slice A3: Web-Native UI Baseline

Scope:

- Remove user-facing dashboard dependence on `@bartools/ui`
- Replace starter button/demo content
- Treat `packages/ui` as mobile-oriented for rendered components during MVP

Deliverable:

- Dashboard routes render through dashboard-local web-native UI

Exit criteria:

- No user-facing route relies on the React Native shared button
- No dashboard route imports rendered UI from `@bartools/ui`

### Slice A4: Mantine Theme And Shell Baseline

Scope:

- Install Mantine
- Add providers
- Add initial shell scaffolding
- Remove `vite-plugin-react-native-web` and `react-native-web` from the dashboard when they are no longer needed

Deliverable:

- Dashboard app boots with Mantine and route scaffolding

Exit criteria:

- Dashboard lint and build pass on the new foundation
- The dashboard no longer depends on RN-web bridge tooling for rendered UI

## Workstream B: Fixture Review Harness

### Slice B1: Fixture Architecture

Scope:

- Choose fixture file layout
- Choose scenario naming pattern
- Choose fixture mode switching strategy
- Choose how Zod fixture validation will be introduced

Deliverable:

- A simple, agreed fixture architecture for dashboard development

Exit criteria:

- Fixture mode is conceptually settled before feature fixtures multiply

### Slice B2: Core Fixture Models

Scope:

- Add reusable fixtures for:
  - user
  - bar settings
  - inventory product rows
  - low-stock rows
  - session list items
  - session detail
- Add Zod schemas for the same core fixture entities

Deliverable:

- A reusable fixture set aligned to dashboard data contracts
- A validated fixture schema layer aligned to dashboard data contracts

Exit criteria:

- Feature pages can reuse shared fixture builders instead of ad hoc objects
- Core fixtures fail loudly when they drift from expected shapes

### Slice B3: Scenario Coverage

Scope:

- Add manager and non-manager scenarios
- Add empty, stale, below-par, and missing-media scenarios

Deliverable:

- Named review scenarios for the most important UX states

Exit criteria:

- Reviewers can intentionally inspect key product states

### Slice B4: Stable Review Routes

Scope:

- Expose stable localhost routes
- Ensure key scenarios are reachable repeatedly

Deliverable:

- Repeatable review entry points for product and design iteration

Exit criteria:

- UI review is not blocked on brittle setup steps

## Workstream C: Shell And Styling

### Slice C1: Theme Tokens

Scope:

- Colors
- Typography
- Spacing
- Radius
- Density defaults

Deliverable:

- Theme token definition aligned to approved styling direction

Exit criteria:

- Theme values exist in one clear place
- Core typography, spacing, radius, color, and density choices are no longer ad hoc

### Slice C2: Public Shell

Scope:

- Layout and spacing for landing/auth routes

Deliverable:

- Stable public shell

Exit criteria:

- Landing and auth routes share a coherent shell
- Signed-out page spacing and structure no longer depend on one-off page decisions

### Slice C3: Authenticated Shell

Scope:

- Primary nav
- Content layout
- Responsive shell behavior

Deliverable:

- Stable signed-in shell

Exit criteria:

- Inventory, Low Stock, Sessions, and Settings have a stable layout home
- Shell behavior remains intentional across desktop, tablet, and phone web

### Slice C4: Shared State Components

Scope:

- Empty
- Loading
- Error
- Stale
- Permission-limited

Deliverable:

- Reusable state patterns for feature pages

Exit criteria:

- MVP pages can express empty, loading, error, stale, and permission-limited states consistently
- Feature teams no longer need to invent one-off state treatments per page

## Workstream D: Account Entry

### Slice D1: Landing

Scope:

- Hero
- product explanation
- proof section
- primary sign in and sign up entry points

Deliverable:

- A reviewable public landing page that clearly routes users into the product

Exit criteria:

- A first-time visitor can understand the product and find the correct next action quickly

### Slice D2: Sign In

Scope:

- Email/password form
- validation
- authentication failure state

Deliverable:

- A functional sign-in route in fixture mode

Exit criteria:

- Existing-user entry flow is reviewable and coherent

### Slice D3: Sign Up

Scope:

- Email/password signup form
- validation
- transition into onboarding

Deliverable:

- A reviewable sign-up route that leads into onboarding

Exit criteria:

- New-user flow does not drop directly into the app without onboarding

### Slice D4: Password Reset

Scope:

- reset request
- reset completion
- invalid/expired token state

Deliverable:

- Complete password recovery review flow

Exit criteria:

- Password recovery is represented end to end in fixture mode

### Slice D5: Onboarding Choice

Scope:

- create-vs-join choice

Deliverable:

- Explicit onboarding fork after signup

Exit criteria:

- Users can understand the two onboarding paths immediately

### Slice D6: Create-Bar Onboarding

Scope:

- bar name
- timezone
- default PAR
- initial manager capability outcome

Deliverable:

- Reviewable create-bar onboarding path

Exit criteria:

- A new bar can be established in fixture mode with the required baseline data

### Slice D7: Join-Bar Onboarding

Scope:

- invite-link consumption
- join failure state
- no duplicate bar-setting entry

Deliverable:

- Reviewable join-bar onboarding path using fixture-generated invite links

Exit criteria:

- Existing-bar join flow is testable before live invite generation exists

### Slice D8: Route Protection

Scope:

- signed-out protection
- signed-in redirect behavior

Deliverable:

- Stable route behavior between public and authenticated surfaces

Exit criteria:

- Signed-out and signed-in routing behavior matches the auth spec

Each slice should be reviewed independently against the auth spec before moving on.

## Workstream E: Settings And Access

### Slice E1: Settings Route Skeleton

Scope:

- route creation
- section layout for bar settings, PAR overrides, and team access

Deliverable:

- Structured settings page shell

Exit criteria:

- Settings has a stable route and section layout

### Slice E2: Bar Settings Form

Scope:

- timezone editing
- default PAR editing in the backend-provided comparable unit
- save/success/error states

Deliverable:

- Reviewable bar settings editing flow

Exit criteria:

- Manager can edit bar-wide defaults in fixture mode
- Comparable-unit semantics are not left ambiguous in the UI or fixture layer

### Slice E3: Product PAR Overrides Table

Scope:

- searchable product list
- override display
- add/update/remove override actions

Deliverable:

- Reviewable product PAR override management UI

Exit criteria:

- Product PAR values can be changed intentionally in fixture mode

### Slice E4: Invite Link Generation

Scope:

- lightweight invite-link generation UI
- out-of-band sharing presentation

Deliverable:

- Reviewable invite-link generation state

Exit criteria:

- Managers can generate a coworker invite link in fixture mode
- Non-managers cannot generate invite links

### Slice E5: Manager Capability Grant Flow

Scope:

- member list
- grant manager capability action

Deliverable:

- Reviewable member-management slice for manager capability only

Exit criteria:

- Managers can grant manager capability without a full team-management console

### Slice E6: Manager Versus Non-Manager States

Scope:

- restricted state presentation
- hidden/disabled controls

Deliverable:

- Clear manager and non-manager settings states

Exit criteria:

- Permission behavior is obvious and reviewable in fixture mode

Each slice should end in a reviewable localhost state for both manager and non-manager users.

## Workstream F: Operational Views

### Slice F1: Inventory Table

Scope:

- route layout
- product table
- required columns
- latest-confirmed aggregate messaging

Deliverable:

- Reviewable inventory table page

Exit criteria:

- Inventory route expresses latest confirmed product-level on-hand stock clearly
- The page does not imply a live stock guarantee or single-session snapshot

### Slice F2: Inventory Search And Sort

Scope:

- search by product name
- sort by product name
- sort by on-hand quantity
- sort by `as of`

Deliverable:

- Reviewable inventory controls

Exit criteria:

- Inventory can be searched and prioritized meaningfully

### Slice F3: Inventory Freshness And State Handling

Scope:

- stale treatment
- latest-confirmed provenance note
- empty state
- loading state
- error state

Deliverable:

- Reviewable inventory state coverage

Exit criteria:

- Inventory feels intentional across all core states
- Mixed recency is communicated honestly without derailing usability

### Slice F4: Low-Stock View

Scope:

- below-par list layout
- flagged-reason display
- export entry point
- latest-confirmed provenance messaging

Deliverable:

- Reviewable low-stock page

Exit criteria:

- Low Stock is clearly understandable as an operational queue
- Low Stock does not imply live stock certainty

### Slice F5: Low-Stock Filtering And Priority Behavior

Scope:

- priority sorting
- lightweight filtering
- state handling consistency

Deliverable:

- Reviewable low-stock interaction behavior

Exit criteria:

- Managers can prioritize the queue effectively

## Workstream G: Session Auditability

### Slice G1: Session History

Scope:

- session list
- timestamps
- user and status display

Deliverable:

- Reviewable session history page

Exit criteria:

- Past sessions are scannable and understandable

### Slice G2: Session Detail

Scope:

- session metadata
- confirmed record display
- timestamp presentation

Deliverable:

- Reviewable session detail page

Exit criteria:

- A user can understand what happened in a selected session

### Slice G3: Thumbnail And Missing-Media Handling

Scope:

- thumbnail display
- placeholder fallback

Deliverable:

- Reviewable media states in session detail

Exit criteria:

- Missing or expired images do not break session auditability

### Slice G4: Original-Versus-Corrected Presentation

Scope:

- comparison display for model output vs corrected values

Deliverable:

- Reviewable correction-comparison UI

Exit criteria:

- The comparison is useful without becoming noisy

## Workstream H: Export

### Slice H1: Inventory Export

Scope:

- current filters
- current sort
- all matching rows

Deliverable:

- Reviewable inventory export behavior

Exit criteria:

- Inventory export matches the page view definition

### Slice H2: Low-Stock Export

Scope:

- low-stock export behavior
- schema verification

Deliverable:

- Reviewable low-stock export behavior

Exit criteria:

- Low-stock export matches the queue view definition

### Slice H3: Session Export Decision And Implementation

Scope:

- explicit deferral from MVP implementation

Deliverable:

- Clear planning note that session export is deferred

Exit criteria:

- No hidden session-export work remains inside MVP assumptions

## Workstream I: Integration And Hardening

### Slice I1: Auth Integration

Scope:

- sign in
- sign up
- reset
- onboarding integration

Deliverable:

- Real auth-entry integration

Exit criteria:

- Entry flows work with real backend behavior

### Slice I2: Settings Integration

Scope:

- timezone
- default PAR
- overrides
- invite links
- manager grants

Deliverable:

- Real settings integration

Exit criteria:

- Settings persist correctly against backend resources
- Manager-only access behavior remains intact against live data

### Slice I3: Inventory And Low-Stock Integration

Scope:

- inventory data
- below-par data
- freshness behavior verification
- confirmed-only aggregation verification
- comparable-unit verification

Deliverable:

- Real operational-view integration

Exit criteria:

- Inventory and Low Stock work against live data
- Inventory and Low Stock do not rely on dashboard-side quantity math invention
- Inventory and Low Stock only reflect confirmed session-derived data

### Slice I4: Sessions Integration

Scope:

- session list
- session detail
- media behavior

Deliverable:

- Real sessions integration

Exit criteria:

- Session auditability holds up against real backend behavior

### Slice I5: Export Integration Decision

Scope:

- client-side versus backend export strategy where needed

Deliverable:

- Explicit export integration strategy

Exit criteria:

- Export approach is intentional across supported views

### Slice I6: Regression And Failure Handling

Scope:

- partial data
- missing data
- permissions
- invite-flow failures

Deliverable:

- Reviewable failure-handling pass

Exit criteria:

- Integration does not break core UX expectations

## Workstream J: Final Polish

### Slice J1: Accessibility Pass

Scope:

- keyboard navigation
- focus states
- labels
- semantic structures

Deliverable:

- Accessibility hardening pass

Exit criteria:

- Core flows meet the MVP accessibility baseline

### Slice J2: Responsive Pass

Scope:

- desktop
- tablet
- phone web

Deliverable:

- Responsive hardening pass

Exit criteria:

- Core routes remain usable across required breakpoints

### Slice J3: Visual Polish Pass

Scope:

- spacing
- hierarchy
- typography
- visual consistency

Deliverable:

- Final visual refinement pass

Exit criteria:

- The dashboard remains aligned with the styling spec after feature integration

### Slice J4: State Tone Pass

Scope:

- empty
- loading
- error
- stale
- permission-limited messaging

Deliverable:

- Final state-tone consistency pass

Exit criteria:

- Calm and operational tone is preserved throughout the app

### Slice J5: Final Regression Pass

Scope:

- auth
- settings
- inventory
- low stock
- sessions

Deliverable:

- Final pre-release regression pass

Exit criteria:

- The MVP is coherent end to end after polish

## Suggested Near-Term Breakdown Priority

The first slices that likely need ticket-level decomposition are:

1. A1 through A4
2. B1 through B4
3. C1 through C4
4. D1 through D8

That is the dependency chain that gets the project from starter app to fully reviewable account-entry flow.
