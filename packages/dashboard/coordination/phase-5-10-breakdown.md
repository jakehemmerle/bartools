# Phase 5 Through Phase 10 Breakdown

## Purpose

Break the remaining implementation phases into concrete engineering tasks:

- Phase 5: Inventory
- Phase 6: Low Stock
- Phase 7: Sessions
- Phase 8: CSV Export
- Phase 9: Backend Integration Hardening
- Phase 10: Final Polish

These phases represent the main product delivery work after the dashboard foundation, shells, auth flows, and settings are already in place.

## Phase 5: Inventory

## Objective

Ship the primary signed-in operational surface: latest confirmed on-hand inventory by product.

## Why This Comes First In Feature Delivery

- Inventory is the default signed-in destination
- Low Stock is a focused derivative of product-level inventory
- Export behavior depends on a stable inventory view definition

## Concrete Tasks

### 5.1 Inventory Route Layout

- Build the inventory page route inside the authenticated shell
- Establish page header and control area
- Place export affordance in the page UI

Done means:

- Inventory has a stable page structure inside the app shell

### 5.2 Product Table

- Implement product-level table layout
- Render:
  - product name
  - category
  - UPC
  - on-hand quantity
  - PAR level
  - below-par status
  - `as of` date
  - latest session link if shown
- Use backend-provided comparable-unit values rather than dashboard-side quantity math

Done means:

- The page expresses inventory using product terminology and the approved fields
- The page reflects latest-confirmed product state rather than implying a live stock value

### 5.3 Search And Filter

- Add search by product name
- Add below-par filtering
- Ensure controls stay usable across breakpoints

Done means:

- The user can narrow the inventory set meaningfully

### 5.4 Sorting

- Add sorting by:
  - product name
  - on-hand quantity
  - `as of` date

Done means:

- Inventory can be scanned and prioritized quickly

### 5.5 Freshness Treatment

- Display `as of` date on every row
- Add a calm page-level note explaining that rows may reflect different confirmed sessions and different dates
- Add stale treatment for inventory older than 14 days
- Keep stale treatment informational, not alarming

Done means:

- Inventory freshness is visible without creating unnecessary noise
- The page is honest about mixed recency and latest-confirmed provenance

### 5.6 Empty, Loading, And Error States

- Implement empty state
- Implement loading state
- Implement non-destructive error state

Done means:

- Inventory feels intentional even when data is incomplete or absent

### 5.7 Responsive And Accessibility Verification

- Verify desktop, tablet, and phone behavior
- Verify keyboard navigation and table semantics

Done means:

- Inventory remains usable across all required form factors

## Phase 5 Exit Criteria

- Inventory is useful as the signed-in homepage
- All core inventory interactions are reviewable in fixture mode
- Product terminology is consistent throughout the page
- Only confirmed session-derived data feeds the inventory aggregate

## Phase 6: Low Stock

## Objective

Ship the focused operational `Below Par` view.

## Why This Comes After Inventory

- It depends on the same product-level inventory model
- It depends on settings-driven PAR configuration
- It should reuse inventory patterns where appropriate instead of inventing a separate subsystem

## Concrete Tasks

### 6.1 Low-Stock Route Layout

- Build the low-stock route structure
- Reuse the authenticated shell and table patterns where helpful

Done means:

- Low Stock has a stable page layout tied to the same design system as Inventory

### 6.2 Below-Par Presentation

- Render product-level below-par rows
- Show reason flagged
- Make clear that low-stock status derives from latest confirmed per-product counts
- Keep urgency cues limited and clear

Done means:

- A manager can understand why a product appears in the queue

### 6.3 Sorting And Filtering

- Add sorting by:
  - lowest on-hand quantity
  - `as of` date
- Add any lightweight filtering kept in scope

Done means:

- Users can prioritize the queue operationally

### 6.4 Empty, Loading, And Error States

- Add empty state for no below-par items
- Add loading and error handling consistent with inventory

Done means:

- Low Stock feels complete, not like a thin derivative page

### 6.5 Export Entry Point

- Add the low-stock export action in the page UI

Done means:

- The page supports the approved export workflow

## Phase 6 Exit Criteria

- Low Stock is clearly derived from product-level inventory and settings-driven PAR logic
- The page is useful as a standalone operational queue
- Only confirmed session-derived data influences low-stock status

## Phase 7: Sessions

## Objective

Ship auditability for past inventory sessions.

## Why This Follows Inventory And Low Stock

- Session history is a supporting audit workflow, not the primary operational homepage
- It depends on stable route, shell, and state patterns already established

## Concrete Tasks

### 7.1 Session History Page

- Build session history route
- Render reverse-chronological list
- Show:
  - session id
  - timestamp
  - user
  - bottle count
  - status if relevant

Done means:

- Users can scan past sessions quickly

### 7.2 Session Detail Page

- Build session detail route
- Render session metadata
- Render confirmed bottle records
- Render relevant timestamps

Done means:

- Users can inspect what was saved in a given session

### 7.3 Thumbnail Handling

- Render thumbnails when present
- Render graceful placeholders when media is missing or expired

Done means:

- Media issues do not break the usefulness of session detail

### 7.4 Original Vs Corrected Presentation

- Add comparison UI when original model output and corrected values exist
- Keep the presentation readable and not overly technical

Done means:

- Session detail supports future training and quality-review use without overwhelming the page

### 7.5 Empty, Loading, And Error States

- Add calm and operational state handling for sessions

Done means:

- Sessions surfaces remain intentional when data is incomplete

### 7.6 Responsive And Accessibility Verification

- Verify sessions across desktop, tablet, and phone
- Verify keyboard navigation and accessible labeling for media and actions

Done means:

- Session pages remain usable across required devices and input modes

## Phase 7 Exit Criteria

- Session history and detail are useful, stable, and audit-friendly

## Phase 8: CSV Export

## Objective

Ship CSV exports that reflect the current user-visible view definition.

## Why This Comes After Core Views

- Export requirements depend on the actual inventory, low-stock, and session surfaces
- It is easier to implement export correctly once the page state and sorting/filtering behavior are settled

## Concrete Tasks

### 8.1 Inventory Export

- Implement inventory export action
- Ensure current filters and sort order are reflected
- Export all matching rows

Done means:

- Inventory export behaves like the spec says, not just like a raw dump

### 8.2 Low-Stock Export

- Implement low-stock export action
- Preserve current filters and sort order

Done means:

- Low-stock export matches the focused queue view

### 8.3 Session Export

- Defer session export from MVP implementation
- Keep the feature out of scope unless the team explicitly re-promotes it later

Done means:

- Session export is intentionally deferred and does not create hidden implementation churn

### 8.4 Timestamp And Schema Verification

- Format timestamps in the bar's local timezone
- Verify required columns per export type
- Keep headers stable and human-readable

Done means:

- CSV output matches the approved export spec

## Phase 8 Exit Criteria

- Supported exports match the current view context and approved schema guidance
- MVP export scope is limited intentionally to inventory and low-stock exports

## Phase 9: Backend Integration Hardening

## Objective

Replace fixtures progressively with real backend integrations and stabilize the MVP.

## Why This Comes After Fixture-Backed Delivery

- The backend is still evolving around the vision problem
- UI and interaction quality should not be blocked on unstable contracts
- Fixture-backed review lets the dashboard mature before integration pressure increases

## Concrete Tasks

### 9.1 Integration Strategy

- Decide route by route whether to switch from fixtures to real resources
- Keep fallback paths or fixture support available during integration
- Do not allow dashboard-side math invention to replace missing backend quantity semantics

Done means:

- Integration does not force the entire dashboard to switch at once

### 9.2 Auth Integration

- Wire sign in, sign up, reset, and onboarding to real backend flows

Done means:

- Entry flows work against real backend behavior

### 9.3 Settings Integration

- Wire timezone, default PAR, product PAR overrides, invite links, and manager capability actions

Done means:

- Settings behavior persists against real data

### 9.4 Inventory And Low-Stock Integration

- Wire product-level inventory and below-par data
- Verify `as of` dates and stale treatment against real responses
- Verify confirmed-only aggregation semantics
- Verify comparable-unit semantics

Done means:

- Operational views work against real inventory data
- Operational views remain aligned with latest-confirmed semantics instead of implying live stock certainty

### 9.5 Sessions Integration

- Wire session list and detail
- Verify missing media handling against real image behavior

Done means:

- Session pages hold up against real backend conditions

### 9.6 Export Integration Decision

- Confirm whether client-side export remains acceptable
- Add backend export resources only where necessary

Done means:

- Export strategy is explicit, not accidental

### 9.7 Regression And Failure Handling

- Verify manager/non-manager permissions
- Verify join/onboarding flows
- Verify partial and missing data handling

Done means:

- Integration did not break the approved UX behaviors

## Phase 9 Exit Criteria

- Core MVP flows work with real backend data
- The dashboard still matches the approved specs after integration

## Phase 10: Final Polish

## Objective

Harden the dashboard for MVP readiness after integration.

## Concrete Tasks

### 10.1 Accessibility Pass

- Verify keyboard navigability
- Verify visible focus states
- Verify semantic forms and tables
- Verify screen-reader labels on core actions and views

### 10.2 Responsive Pass

- Verify all required routes on desktop, tablet, and phone web
- Tune layout density and collapse behavior

### 10.3 Visual Polish Pass

- Tune spacing, hierarchy, and typography
- Remove remaining starter-looking or generic UI rough edges
- Ensure public and authenticated surfaces still feel related but distinct

### 10.4 State Tone Pass

- Review empty, loading, error, stale, and permission-limited messaging
- Keep tone calm and operational

### 10.5 Final Regression Pass

- Recheck inventory
- Recheck low stock
- Recheck sessions
- Recheck settings and manager capability
- Recheck auth and onboarding

## Phase 10 Exit Criteria

- The implemented dashboard feels coherent, polished, and aligned with the spec set

## Combined Exit Criteria For Phases 5 Through 10

- The operational views are complete
- Export behavior is implemented intentionally
- Real backend integration is stable
- The product remains accessible, responsive, and visually coherent after integration

## Suggested Validation Gates

- `bun --filter @bartools/dashboard lint`
- `bun --filter @bartools/dashboard build`
- `bun test`

## Suggested Immediate Checklist For These Phases

1. Build Inventory
2. Build Low Stock
3. Build Sessions
4. Add CSV export behaviors
5. Integrate real backend resources progressively
6. Run accessibility, responsive, and polish passes
