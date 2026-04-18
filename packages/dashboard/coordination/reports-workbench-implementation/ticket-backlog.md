# Reports Workbench Ticket Backlog

## Purpose

Turn the current reports-workbench planning set into execution-sized tickets that are:

- smaller than the old dashboard-era slices
- grounded in the current codebase shape
- anchored to the approved screen set
- reviewable without hidden design or semantic drift

This backlog is the live ticket layer for the current web build.

It supersedes the older root-level dashboard ticket backlog for day-to-day implementation of the reports-first workbench.

## Working Rules

- Prefer more, smaller tickets over fewer, blurrier tickets.
- Do not merge adjacent tickets just because they touch the same files.
- A ticket that changes visible UI should leave behind review evidence per `review-evidence-protocol.md`.
- No screen-fidelity ticket should be considered complete until the relevant review routes are protected by tests and the evidence scaffold exists for that screen family.
- A ticket that changes architecture boundaries should update the relevant planning docs in the same change set.
- A ticket that touches dependencies must be called out explicitly before implementation, because dependency changes require user approval.

## Ticket Format

Each ticket includes:

- `Outcome`
- `Current baseline`
- `Depends on`
- `Primary anchors`
- `Validation`

## Workstream A: Foundation And Shell Completion

### RWB-001: Router Inventory Lock

Outcome:

- confirm the real-route, review-route, and legacy-redirect behavior in `src/app/router.tsx`
- remove any ambiguity about which routes are product surfaces versus review-only surfaces

Current baseline:

- the router already includes the correct broad route families
- this ticket is about locking the behavior with the current reports-workbench rules, not inventing a new router

Depends on:

- none

Primary anchors:

- `screen-inventory.md`
- `state-visibility-matrix.md`

Validation:

- `/`, `/reports`, and `/reports/:reportId` remain the only real product routes
- legacy routes still redirect rather than rendering fake surfaces
- router tests cover review routes and redirects clearly

### RWB-002: Legacy Layout Cleanup

Outcome:

- remove or clearly demote leftover legacy layout paths that belong to the older dashboard structure
- make `components/shell/` the obvious home for shell ownership

Current baseline:

- canonical shell files already exist
- older layout paths still exist in the repo and can cause quiet confusion

Depends on:

- `RWB-001`

Primary anchors:

- `architecture-and-file-plan.md`
- `phase-1-2-file-checklist.md`

Validation:

- shell ownership is obvious from the file tree
- no active route depends on legacy layout files by accident

### RWB-049: Fixture Session Runtime Quarantine

Outcome:

- remove or isolate the old fixture-session runtime from the active reports-workbench app root
- ensure the current app provider tree reflects reports-first reality instead of carrying dormant full-dashboard persona logic

Current baseline:

- `AppProviders` still mounts `FixtureSessionProvider`
- the current reports-first app does not need the old signed-out/manager/staff fixture runtime to render its active product routes

Depends on:

- `RWB-001`

Primary anchors:

- `implementation-principles.md`
- `architecture-and-file-plan.md`
- `planning-status.md`

Validation:

- the active app root no longer depends on legacy full-dashboard persona state unless that dependency is explicitly justified
- provider responsibilities are clearer after the cleanup

### RWB-050: Legacy Fixture Scope Quarantine

Outcome:

- isolate or clearly demote old inventory/settings-era fixture data so it cannot quietly steer the reports-workbench build
- make reports review scenarios the obvious live fixture layer for the current app

Current baseline:

- `src/lib/fixtures/scenarios.ts` still contains broader dashboard-era scenario families
- the current reports review harness reads from a newer reports-specific scenario layer while the older fixture tree remains live in the repo

Depends on:

- `RWB-049`

Primary anchors:

- `planning-status.md`
- `screen-inventory.md`
- `architecture-and-file-plan.md`

Validation:

- the reports-workbench fixture path is obvious
- old non-reports fixtures are either archived, isolated, or clearly marked as historical
- new reports tickets no longer need to mentally route through the old dashboard fixture world

### RWB-003: Token Contract Audit

Outcome:

- verify that the implemented token files match `visual-token-spec.md`
- close any remaining ad hoc color, spacing, radius, or shadow drift

Current baseline:

- token files already exist under `src/app/theme/`
- the remaining work is audit-and-tighten, not greenfield token creation

Depends on:

- `RWB-001`

Primary anchors:

- `visual-token-spec.md`
- `backpressure-and-review-gates.md`

Validation:

- token values live in one clear place
- visible screens no longer rely on ad hoc raw values where the token contract already defines a role

### RWB-004: Typography Role Audit

Outcome:

- make typography roles match the locked design hierarchy
- ensure entry, list, and detail surfaces all use the same type system intentionally

Current baseline:

- typography tokens already exist
- this ticket is about role correctness and consistency, not font experimentation

Depends on:

- `RWB-003`

Primary anchors:

- `visual-token-spec.md`
- `screen-composition-spec.md`

Validation:

- heading, eyebrow, metadata, body, and control text roles are consistently applied
- no route still reads like library-default typography

### RWB-005: Public Shell Fidelity

Outcome:

- make the public shell faithfully support the approved entry screen
- tighten the top bar, centered composition, and ambient framing behavior

Current baseline:

- public shell and top bar files already exist
- the job is to make them feel final instead of merely present

Depends on:

- `RWB-003`
- `RWB-004`

Primary anchors:

- `screen-composition-spec.md`
- `component-map.md`

Validation:

- `/` matches the approved entry family closely
- no auth, signup, or unsupported-product chrome leaks into the entry shell

### RWB-006: Workbench Shell Fidelity

Outcome:

- make the workbench shell feel like the approved BARTOOLS product family
- tighten top bar, canvas width, gutters, and detail/list frame behavior

Current baseline:

- workbench shell files already exist
- the shell is functional, but still needs fidelity-level refinement

Depends on:

- `RWB-003`
- `RWB-004`

Primary anchors:

- `screen-composition-spec.md`
- `component-map.md`
- `backpressure-and-review-gates.md`

Validation:

- `/reports` and `/reports/:reportId` feel like the same product family
- shell-level screenshot evidence exists for changed screens

### RWB-007: Responsive Shell Pass

Outcome:

- make shell behavior deliberate at desktop, tablet, and narrow widths
- prevent early desktop-only assumptions from hardening into drift

Current baseline:

- desktop-first structure exists
- responsive behavior is the next likely drift vector

Depends on:

- `RWB-005`
- `RWB-006`

Primary anchors:

- `screen-composition-spec.md`
- `review-evidence-protocol.md`

Validation:

- shell captures exist at desktop and at least one smaller breakpoint
- no key screen collapses into generic mobile-card sludge

### RWB-008: Primitive Fidelity Sweep

Outcome:

- audit and refine `AppWordmark`, `StatusChip`, `SectionEyebrow`, `SurfaceCard`, `Button`, and `Select`
- make them trustworthy building blocks for the remaining UI passes

Current baseline:

- these primitives already exist
- they are good scaffolds but still need one intentional consistency pass

Depends on:

- `RWB-003`
- `RWB-004`

Primary anchors:

- `component-map.md`
- `code-quality-gates.md`

Validation:

- primitive usage is visually consistent across current screens
- no screen is compensating for weak primitives with one-off overrides

## Workstream B: Review Harness Hardening

### RWB-009: Scenario Coverage Audit

Outcome:

- verify that every approved screen has one canonical review scenario
- close any gaps between the golden set and `review-scenarios.ts`

Current baseline:

- scenario scaffolding already exists
- this ticket is about completeness and naming discipline

Depends on:

- `RWB-001`

Primary anchors:

- `screen-inventory.md`
- `state-visibility-matrix.md`

Validation:

- all eleven approved screen families map to explicit scenario names
- blocked and not-found remain explicit scenarios, not convenience fallbacks

### RWB-010: Review Route Naming And Coverage Lock

Outcome:

- make review-route naming and scenario mapping fully deterministic
- ensure the route list mirrors the approved screen inventory exactly

Current baseline:

- review routes already exist
- the current task is to lock them into the live review contract

Depends on:

- `RWB-009`

Primary anchors:

- `screen-inventory.md`
- `component-map.md`

Validation:

- every approved review route resolves predictably
- no review route is missing or mapped through brittle branching

### RWB-051: Review Scenario Structural Test Pass

Outcome:

- add explicit structural tests for the named review scenarios that power the approved screen set
- make scenario drift fail loudly before it becomes visual drift

Current baseline:

- review scenarios exist
- the planning docs call for scenario tests, but the live ticket layer did not yet budget them explicitly

Depends on:

- `RWB-009`

Primary anchors:

- `phase-1-2-file-checklist.md`
- `state-visibility-matrix.md`
- `screen-inventory.md`

Validation:

- a dedicated test file validates the named review scenarios
- blocked, not-found, failed-emphasis, and comparison-emphasis scenarios are all asserted explicitly

### RWB-011: Review Preview State Harness Cleanup

Outcome:

- clean up `review-detail-preview.tsx` so it reads as intentional harness code rather than temporary glue
- centralize reusable preview-only state helpers if needed

Current baseline:

- `review-detail-preview.tsx` exists and works
- it is the sharpest place for harness logic to become quietly messy

Depends on:

- `RWB-009`
- `RWB-010`

Primary anchors:

- `architecture-and-file-plan.md`
- `code-quality-gates.md`

Validation:

- preview-only state logic has clear ownership
- no duplicated review-draft behavior spreads across many review routes

### RWB-012: Review Route Test Matrix

Outcome:

- add or finish route tests for the full review harness
- make sure every approved screen stays reachable

Current baseline:

- some route tests already exist
- review harness coverage is not yet complete enough to trust blindly

Depends on:

- `RWB-010`
- `RWB-051`

Primary anchors:

- `review-evidence-protocol.md`
- `state-visibility-matrix.md`

Validation:

- route tests cover all approved review routes
- blocked and not-found paths are asserted explicitly

## Workstream C: Reports List Family

### RWB-013: Reports List Loading State Pass

Outcome:

- refine the loading state so it belongs to the same visual family as the list and empty state

Current baseline:

- loading behavior exists in `reports-list-screen.tsx`
- it still needs a deliberate fidelity pass

Depends on:

- `RWB-006`

Primary anchors:

- `screen-composition-spec.md`
- `state-visibility-matrix.md`

Validation:

- loading state feels intentional, calm, and on-brand
- no generic “dev panel” energy remains

### RWB-014: Reports Empty State Fidelity

Outcome:

- make the empty state match the approved composition, spacing, and tone

Current baseline:

- `ReportsEmptyScreen` exists
- this ticket is about visual and copy fidelity

Depends on:

- `RWB-006`

Primary anchors:

- `screen-composition-spec.md`
- `screen-inventory.md`

Validation:

- empty state matches approved family closely
- empty state does not imply error or breakage

### RWB-015: Reports List Row Composition

Outcome:

- make report rows match the approved density, field order, and hierarchy
- keep the list decisively out of stock-table territory

Current baseline:

- custom rows already exist
- row composition is the core fidelity task for this screen

Depends on:

- `RWB-006`
- `RWB-008`

Primary anchors:

- `screen-composition-spec.md`
- `state-visibility-matrix.md`

Validation:

- row hierarchy matches the approved design
- report id, status, operator, timestamps, and bottle count all read correctly

### RWB-016: Reports List Responsive Collapse

Outcome:

- implement the approved tablet and narrow-width collapse rules for the list

Current baseline:

- desktop list exists
- responsive collapse is where list screens often regress into generic stacked cards

Depends on:

- `RWB-015`

Primary anchors:

- `screen-composition-spec.md`
- `review-evidence-protocol.md`

Validation:

- narrow-width captures preserve the intended field hierarchy
- the list does not devolve into badge-heavy card spam

### RWB-017: Reports List Interaction Polish

Outcome:

- refine hover, focus, click-target, and link affordance behavior for report rows

Current baseline:

- row navigation exists
- interaction polish still needs a deliberate pass

Depends on:

- `RWB-015`

Primary anchors:

- `component-map.md`
- `code-quality-gates.md`

Validation:

- rows are clearly interactive without becoming flashy
- keyboard and pointer behavior remain aligned

## Workstream D: Detail Shell And Shared Record Structure

### RWB-018: Report Header Fidelity

Outcome:

- refine `report-header.tsx` so report identity, status, and metadata hierarchy match the approved family

Current baseline:

- header structure already exists
- it needs a dedicated fidelity pass before deeper state-specific refinement

Depends on:

- `RWB-006`

Primary anchors:

- `screen-composition-spec.md`
- `component-map.md`

Validation:

- header works coherently across created, processing, unreviewed, reviewed, and failed states

### RWB-019: Metadata Slab And Progress Panel Pass

Outcome:

- refine shared metadata presentation and the processing progress block

Current baseline:

- metadata and progress logic exist in current detail components
- this ticket tightens shared presentation before state-specific tuning

Depends on:

- `RWB-018`

Primary anchors:

- `screen-composition-spec.md`
- `state-visibility-matrix.md`

Validation:

- metadata remains coherent across detail states
- processing state progress presentation matches the approved tone

### RWB-020: Record Card Structure Extraction

Outcome:

- split the shared record-card structure into clearer child components before more detail-state complexity lands

Current baseline:

- `report-detail-content.tsx` is already near the file-size cap
- this is the obvious place where future drift could turn into a helper graveyard

Depends on:

- `RWB-018`

Primary anchors:

- `architecture-and-file-plan.md`
- `code-quality-gates.md`

Validation:

- shared record structure has clearer ownership
- the split reduces conceptual load instead of just scattering code

### RWB-021: Record Media And Fallback Treatment

Outcome:

- implement and refine image, missing-image, and failed-media treatment for report records

Current baseline:

- basic media handling exists
- fallback behavior needs a dedicated fidelity pass

Depends on:

- `RWB-020`

Primary anchors:

- `state-visibility-matrix.md`
- `screen-inventory.md`

Validation:

- missing media is calm and consistent
- media treatment does not break the detail family hierarchy

### RWB-022: Record Summary And Metadata Pass

Outcome:

- make record-level summary information read cleanly across inferred, failed, and reviewed records

Current baseline:

- record-level content exists inside the current detail family
- this ticket tightens hierarchy before interaction-heavy work

Depends on:

- `RWB-020`

Primary anchors:

- `component-map.md`
- `screen-composition-spec.md`

Validation:

- record summary blocks read consistently across all relevant states

## Workstream E: Detail State Variants

### RWB-023: Created State Fidelity

Outcome:

- make the created state match the approved minimal composition and copy exactly enough

Current baseline:

- created state rendering exists
- this ticket is a dedicated fidelity lock

Depends on:

- `RWB-018`

Primary anchors:

- `screen-composition-spec.md`
- `state-visibility-matrix.md`

Validation:

- created state shows only allowed elements
- no fake records or review controls appear

### RWB-024: Processing State Fidelity

Outcome:

- make the processing state visually plausible and semantically clean

Current baseline:

- processing state rendering exists
- this ticket aligns it more tightly to approved behavior

Depends on:

- `RWB-019`

Primary anchors:

- `screen-composition-spec.md`
- `state-visibility-matrix.md`

Validation:

- progress and passive processing rows read correctly
- no review affordances leak into processing

### RWB-025: Unreviewed State Fidelity

Outcome:

- make the primary review state feel correct before comparison and failed emphasis work

Current baseline:

- unreviewed flow exists as scaffold
- this remains the main detail-state workload

Depends on:

- `RWB-020`
- `RWB-022`

Primary anchors:

- `screen-composition-spec.md`
- `state-visibility-matrix.md`

Validation:

- unreviewed records, controls, and action bar read as one coherent workflow

### RWB-026: Reviewed State Fidelity

Outcome:

- make the reviewed state clearly resolved and read-only

Current baseline:

- reviewed rendering exists
- the main risk is lingering edit affordances or weak final-value emphasis

Depends on:

- `RWB-025`

Primary anchors:

- `state-visibility-matrix.md`
- `screen-composition-spec.md`

Validation:

- reviewed state is visibly resolved
- no editing affordances survive

### RWB-027: Comparison-Emphasis Fidelity

Outcome:

- make the comparison screen read as audit context with corrected values as final truth

Current baseline:

- comparison support exists in current screens and view-models
- the layout and emphasis still need a dedicated pass

Depends on:

- `RWB-026`

Primary anchors:

- `state-visibility-matrix.md`
- `screen-composition-spec.md`

Validation:

- original and final values are visually distinct
- corrected values clearly win the hierarchy

### RWB-028: Failed-Emphasis Fidelity

Outcome:

- make failed records feel recoverable, not catastrophic

Current baseline:

- failed rendering exists
- this is a distinct emphasis pass, not just a copy tweak

Depends on:

- `RWB-025`

Primary anchors:

- `state-visibility-matrix.md`
- `screen-composition-spec.md`

Validation:

- failed records retain review controls
- tone stays calm and operational

### RWB-029: Blocked State Fidelity

Outcome:

- make the integration-blocked state match the approved screen and backend-readiness framing

Current baseline:

- blocked screen exists
- this ticket makes it feel final and semantically exact

Depends on:

- `RWB-006`

Primary anchors:

- `screen-inventory.md`
- `state-visibility-matrix.md`
- `screen-composition-spec.md`

Validation:

- blocked state shows the approved explanation and actions only
- no fake report content appears

### RWB-030: Not-Found State Fidelity

Outcome:

- make the missing-report state calm, intentional, and in-family

Current baseline:

- not-found screen exists
- this ticket is a dedicated copy-and-composition pass

Depends on:

- `RWB-006`

Primary anchors:

- `screen-inventory.md`
- `state-visibility-matrix.md`

Validation:

- not-found state stays in-family
- no generic app-error tone appears

## Workstream F: Review Controls And Draft Truth

### RWB-031: Bottle Match Control

Outcome:

- implement the product-match interaction so it is visually and semantically faithful

Current baseline:

- select/search behavior exists in scaffold form
- this ticket turns it into a trustworthy product control

Depends on:

- `RWB-008`
- `RWB-025`

Primary anchors:

- `architecture-and-file-plan.md`
- `state-visibility-matrix.md`

Validation:

- product match control works in unreviewed and failed states only
- control copy and behavior stay backend-truthful

### RWB-032: Fill Tenths Control

Outcome:

- implement the discrete tenths control so it matches the approved interaction family

Current baseline:

- fill editing exists
- the final visible control still needs a dedicated fidelity pass

Depends on:

- `RWB-025`

Primary anchors:

- `screen-composition-spec.md`
- `state-visibility-matrix.md`

Validation:

- visible choices stay `0` through `10`
- no percentages or decimal framing leaks back in

### RWB-033: Review Action Bar And Completeness Gating

Outcome:

- implement the report-level review action exactly once, with correct enablement rules

Current baseline:

- submission state logic already exists
- the visible action bar and disablement behavior still need final locking

Depends on:

- `RWB-031`
- `RWB-032`

Primary anchors:

- `state-visibility-matrix.md`
- `screen-composition-spec.md`

Validation:

- submit action is report-level only
- incomplete drafts cannot submit
- reviewed, blocked, and not-found states do not show active submission

### RWB-034: Review Draft Payload Tests

Outcome:

- add or tighten tests around review-draft completeness and payload shape

Current baseline:

- draft logic and tests already exist
- this ticket strengthens the contract around the final review UI

Depends on:

- `RWB-033`

Primary anchors:

- `code-quality-gates.md`
- `state-visibility-matrix.md`

Validation:

- tests assert exact payload shape
- tests cover incomplete and complete drafts

### RWB-035: Comparison View-Model Tests

Outcome:

- add or tighten view-model tests for original-versus-corrected comparison behavior

Current baseline:

- comparison view-model code already exists
- regression protection is still lighter than it should be

Depends on:

- `RWB-027`

Primary anchors:

- `architecture-and-file-plan.md`
- `code-quality-gates.md`

Validation:

- tests protect corrected-value emphasis and original-value fallback behavior

## Workstream G: Stream And Readiness Behavior

### RWB-036: Stream Event Fidelity

Outcome:

- make sure stream-applied updates produce the right visible state changes without semantic drift

Current baseline:

- stream reducer and route wiring already exist
- this ticket hardens the behavior against subtle regressions

Depends on:

- `RWB-024`
- `RWB-025`

Primary anchors:

- `execution-plan.md`
- `state-visibility-matrix.md`

Validation:

- stream tests cover key event application
- processing-to-ready transitions remain believable

### RWB-037: Detail Route State Management Cleanup

Outcome:

- reduce complexity in `report-detail-route.tsx` before more activation work lands

Current baseline:

- the route file is already one of the larger feature-route files
- it currently owns multiple concerns: fetch, stream, draft state, and search state

Depends on:

- `RWB-036`

Primary anchors:

- `architecture-and-file-plan.md`
- `code-quality-gates.md`

Validation:

- route responsibilities are clearer
- the file stays comfortably below the complexity danger zone

### RWB-038: Real-Route Readiness Messaging Pass

Outcome:

- make the real-route blocked/readiness messaging consistent with the frontend integration gate

Current baseline:

- readiness messaging already exists in client/provider usage
- this ticket aligns the visible message and blocked semantics intentionally

Depends on:

- `RWB-029`
- `RWB-037`

Primary anchors:

- `screen-inventory.md`
- `implementation-principles.md`

Validation:

- real routes explain the integration gate calmly
- review routes and real routes tell the same truth without pretending backend activation exists

## Workstream H: Copy, Evidence, And Scope Audit

### RWB-039: Copy Scrub

Outcome:

- remove any remaining dev-process, fake-product, or old-dashboard copy

Current baseline:

- the current app has already improved a lot
- copy drift is still one of the easiest regressions to reintroduce

Depends on:

- `RWB-014`
- `RWB-023`
- `RWB-024`
- `RWB-025`
- `RWB-026`
- `RWB-027`
- `RWB-028`
- `RWB-029`
- `RWB-030`

Primary anchors:

- `state-visibility-matrix.md`
- `screen-composition-spec.md`

Validation:

- no session-era, auth-era, or dev-process language remains in visible UI
- visible copy stays calm and operational

### RWB-040: Unsupported-Surface Redirect Audit

Outcome:

- confirm that unsupported surfaces still redirect and do not regain product-like behavior

Current baseline:

- redirects already exist
- this ticket is a scope-protection pass

Depends on:

- `RWB-001`

Primary anchors:

- `screen-inventory.md`
- `backpressure-and-review-gates.md`

Validation:

- inventory, low-stock, settings, auth, and onboarding routes remain redirects
- no unsupported surface is accidentally revived by shell work

### RWB-041: Review Evidence Scaffold

Outcome:

- create the first proper evidence bundle structure for the current implementation track

Current baseline:

- the protocol exists
- the evidence habit needs to become real, not aspirational

Depends on:

- `RWB-010`

Primary anchors:

- `review-evidence-protocol.md`

Validation:

- one real evidence bundle exists with `summary.md`, `checklist.md`, and `screens/`

### RWB-042: Shell And List Evidence Pass

Outcome:

- capture approved-comparison evidence for entry, reports list, and reports empty

Current baseline:

- route structure exists
- this ticket turns current visible work into reviewable proof

Depends on:

- `RWB-041`
- `RWB-005`
- `RWB-006`
- `RWB-014`
- `RWB-015`
- `RWB-016`

Primary anchors:

- `review-evidence-protocol.md`
- `screen-composition-spec.md`

Validation:

- screenshot bundle includes entry, reports list, and reports empty
- checklist verdicts are written down explicitly

### RWB-043: Detail Family Evidence Pass

Outcome:

- capture approved-comparison evidence for all detail-state screens

Current baseline:

- review routes exist for the detail family
- the missing piece is durable comparison evidence

Depends on:

- `RWB-023`
- `RWB-024`
- `RWB-025`
- `RWB-026`
- `RWB-027`
- `RWB-028`
- `RWB-029`
- `RWB-030`

Primary anchors:

- `review-evidence-protocol.md`
- `state-visibility-matrix.md`

Validation:

- screenshot bundle includes all detail-state screens touched by the pass
- summary and checklist files are complete

## Workstream I: Test Hardening And Backend Activation Readiness

### RWB-044: List Component Test Pass

Outcome:

- add or tighten component-level tests for list screens, row composition, and empty/loading branching

Current baseline:

- list route tests exist
- component-level protection is still lighter than the fidelity bar deserves

Depends on:

- `RWB-015`
- `RWB-016`

Primary anchors:

- `code-quality-gates.md`
- `component-map.md`

Validation:

- list behavior regressions are caught below the route level where useful

### RWB-045: Detail Component Test Pass

Outcome:

- add or tighten component-level tests for the detail family, especially shared record behavior

Current baseline:

- detail rendering exists
- component-level regression coverage still needs strengthening

Depends on:

- `RWB-020`
- `RWB-021`
- `RWB-022`

Primary anchors:

- `code-quality-gates.md`
- `component-map.md`

Validation:

- core detail rendering logic is protected by focused component tests

### RWB-046: Review Control Test Pass

Outcome:

- add or tighten tests for bottle match, fill tenths, and submit enablement behavior

Current baseline:

- draft/state logic exists
- interaction-level protection remains too easy to under-specify

Depends on:

- `RWB-031`
- `RWB-032`
- `RWB-033`

Primary anchors:

- `state-visibility-matrix.md`
- `code-quality-gates.md`

Validation:

- tests protect the allowed interaction matrix

### RWB-047: Full Route Regression Pass

Outcome:

- make sure route-level tests protect real routes, review routes, redirects, blocked behavior, and not-found behavior together

Current baseline:

- route tests already exist in partial form
- this ticket makes them comprehensive enough for ongoing iteration

Depends on:

- `RWB-012`
- `RWB-040`

Primary anchors:

- `screen-inventory.md`
- `state-visibility-matrix.md`

Validation:

- route-level regression coverage matches the active route inventory

### RWB-048: Backend Activation Readiness Checklist

Outcome:

- write the exact checklist for moving from fixture-backed reports routes to real backend activation once venue/user context exists

Current baseline:

- the app already has a client boundary and readiness messaging
- the remaining risk is vague activation criteria

Depends on:

- `RWB-038`

Primary anchors:

- `execution-plan.md`
- `implementation-principles.md`

Validation:

- the activation gate is written down clearly
- remaining backend work is framed as wiring, not redesign

## Recommended First Execution Stretch

If implementation resumes immediately from this backlog, the best opening ticket chain is:

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

That sequence is slightly less glamorous, but it is healthier.
It cleans out old runtime baggage first, locks the review harness before fidelity work, and makes the first visible passes evidence-backed instead of vibes-backed.
