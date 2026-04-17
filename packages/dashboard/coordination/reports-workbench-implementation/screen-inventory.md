# Screen Inventory

This document translates the approved mockups into concrete app surfaces.

## Approved Visual Bundle

All visual references live in:
- `packages/dashboard/coordination/golden-set-approved/`

## Route Model

### Real App Routes

- `/`
  Entry surface

- `/reports`
  Reports list or reports empty state

- `/reports/:reportId`
  Report detail family

### Redirected Legacy Routes

These remain redirects for now and are not real product surfaces:
- `/inventory`
- `/low-stock`
- `/settings`
- `/sign-in`
- `/sign-up`
- `/reset-password`
- `/onboarding/create`
- `/onboarding/join`

## Review Harness Route Model

The real routes are not enough for deterministic screen review.

The implementation should add a dedicated review harness route family such as:

- `/__review/entry`
- `/__review/reports/list`
- `/__review/reports/empty`
- `/__review/report/created`
- `/__review/report/processing`
- `/__review/report/unreviewed`
- `/__review/report/reviewed`
- `/__review/report/comparison`
- `/__review/report/failed`
- `/__review/report/blocked`
- `/__review/report/not-found`

These routes are for local verification only.
They let us compare implementation to the golden-set screens without needing runtime branching tricks in the main product routes.

## Screen Breakdown

### 1. Entry

Reference:
- `golden-set-approved/reports_workbench_entry`

Purpose:
- introduce the reports workbench
- set the visual tone
- provide the narrow entry into the product

Must include:
- public shell
- BARBACK identity
- reports-workbench framing
- restrained primary CTA toward reports workbench

Must not include:
- signup promises
- inventory/settings/analytics framing
- dev-process or MVP copy

### 2. Reports List

Reference:
- `golden-set-approved/reports_list`

Purpose:
- show recent reports
- communicate status at a glance
- let the user enter report detail

Must include:
- list of reports
- report identity
- timing metadata
- operator metadata where available
- bottle count
- report status

Implementation decision now locked:
- reports list uses custom BARBACK row composition
- stock data-table components are not allowed to define the visible list presentation
- semantic list markup or CSS grid composition is fine
- stock admin-table chrome is not

### 3. Reports Empty State

Reference:
- `golden-set-approved/reports_list_empty_state`

Purpose:
- communicate that no reports exist yet without implying breakage

Must include:
- same family as reports list
- calm empty-state message
- no fake utility chrome

### 4. Report Detail: Created

Reference:
- `golden-set-approved/report_detail_created`

Purpose:
- communicate that a report exists but processing has not meaningfully advanced

Must include:
- detail shell
- report identity
- created-state messaging
- no fake review controls

### 5. Report Detail: Processing

Reference:
- `golden-set-approved/report_detail_processing`

Purpose:
- show in-flight processing without pretending review is ready

Must include:
- report identity
- progress/state communication
- in-progress tone

Must not include:
- review draft controls
- corrected-value UI

### 6. Report Detail: Unreviewed

Reference:
- `golden-set-approved/report_detail_unreviewed_revised`

Purpose:
- primary review workflow
- inspect records
- choose product match
- choose fill level

Must include:
- report header
- record list
- image/fallback media handling
- status chips
- product match control
- fill-level tenths control
- final review submission action

Must not include:
- per-record submit buttons
- percentage-labeled fill interaction

### 7. Report Detail: Reviewed

Reference:
- `golden-set-approved/report_detail_reviewed_revised`

Purpose:
- show a resolved report after review submission

Must include:
- reviewed-state report header
- records in resolved state
- final values presentation

### 8. Report Detail: Comparison Emphasis

Reference:
- `golden-set-approved/report_detail_comparison_emphasis_final`

Purpose:
- show strong original-versus-corrected comparison for a reviewed record

Must include:
- original model output side
- final corrected values side
- corrected field emphasis
- report-id-first identity

Must not include:
- extra actions
- export controls
- workflow clutter

### 9. Report Detail: Failed Emphasis

Reference:
- `golden-set-approved/report_detail_failed_emphasis_final`

Purpose:
- show failed records as recoverable review work

Must include:
- failed record emphasis
- specific error block
- product match control
- fill-level tenths control
- single report-level review action

Must not include:
- catastrophic tone
- unsupported failure copy
- per-record submission

### 10. Report Detail: Blocked

Reference:
- `golden-set-approved/report_detail_blocked_state`

Purpose:
- explicitly communicate integration-readiness blockage

Must include:
- blocked explanation
- same app family
- no fake report content

This screen is especially important because backend integration is intentionally gated on venue/auth context.

### 11. Report Detail: Not Found

Reference:
- `golden-set-approved/report_detail_not_found_state`

Purpose:
- communicate missing or unknown report id

Must include:
- same app family
- calm missing-state treatment

## Data Dependency Matrix

### List Surface

Needs:
- `ReportListItem[]`

### Detail Surfaces

Needs:
- `ReportDetail`
- derived progress view
- derived review draft view
- derived stream-applied view state

### Reviewable Detail Surfaces

Needs:
- bottle search results
- local review draft state
- final payload generation

### Integration-Blocked Surface

Needs:
- readiness state from client boundary

## Acceptance Shape

Each screen implementation is complete only when:
- a real app route or review route renders it deterministically
- its structure can be visually compared to the golden-set screen
- its block order matches `screen-composition-spec.md`
- its copy and action model remain within backend scope
- it has at least one test covering the main state
