# Component Map

This document maps each approved screen to the concrete React components that should render it.

The goal is to prevent two common implementation failures:
- stuffing too much behavior into route components
- rebuilding each screen from scratch instead of sharing the right structure

## Design Constraint

The approved mockups are not eleven unrelated pages.

They are:
- one public entry surface
- one reports list family
- one report-detail family with state variants

The component structure should mirror that reality.

## Top-Level Route Components

### `/`

Route component:
- `features/reports/routes/entry-route.tsx`

Primary screen component:
- `features/reports/components/entry-screen.tsx`

Shell:
- `components/shell/public/public-shell.tsx`

### `/reports`

Route component:
- `features/reports/routes/reports-route.tsx`

Primary screen components:
- `features/reports/components/reports-list-screen.tsx`
- `features/reports/components/reports-empty-screen.tsx`

Shell:
- `components/shell/workbench/workbench-shell.tsx`

### `/reports/:reportId`

Route component:
- `features/reports/routes/report-detail-route.tsx`

Primary screen family:
- `features/reports/components/report-detail-screen.tsx`

Shell:
- `components/shell/workbench/workbench-shell.tsx`

## Review Harness Route Components

These should be thin wrappers over screen-level components and fixtures.

Suggested files:
- `features/reports/routes/review-entry-route.tsx`
- `features/reports/routes/review-reports-list-route.tsx`
- `features/reports/routes/review-reports-empty-route.tsx`
- `features/reports/routes/review-report-created-route.tsx`
- `features/reports/routes/review-report-processing-route.tsx`
- `features/reports/routes/review-report-unreviewed-route.tsx`
- `features/reports/routes/review-report-reviewed-route.tsx`
- `features/reports/routes/review-report-comparison-route.tsx`
- `features/reports/routes/review-report-failed-route.tsx`
- `features/reports/routes/review-report-blocked-route.tsx`
- `features/reports/routes/review-report-not-found-route.tsx`

These routes should not own custom layout logic.
They should only:
- pick a scenario
- pass it into screen components
- keep deterministic review rendering stable

## Shell-Level Components

## Public Shell Family

### `PublicShell`

Responsibilities:
- background treatment
- public top bar
- page width
- outer content framing

Should render:
- BARBACK wordmark
- restrained workbench entry CTA
- child screen content

Should not render:
- report-specific content

### `PublicTopBar`

Responsibilities:
- wordmark
- small supporting line if kept
- primary CTA

Potential extraction reason:
- keeps shell component simple
- allows easier visual iteration

## Workbench Shell Family

### `WorkbenchShell`

Responsibilities:
- top bar
- desktop page frame
- main content canvas

Should not assume:
- sidebar navigation must exist

Important note:
- the current shell implementation likely drifts from the approved mockups
- this file is a likely heavy refactor, not a light touch-up

### `WorkbenchTopBar`

Responsibilities:
- BARBACK identity
- page-level back action if required by final composition
- narrow workbench framing

### `WorkbenchCanvas`

Responsibilities:
- page max width
- vertical spacing rhythm
- content alignment

Reason to extract:
- list and detail pages share strong spatial rules

## Shared Primitive Components

These are small but important because they carry the product language.

### `AppWordmark`

Use for:
- public shell
- workbench shell

Responsibilities:
- consistent BARBACK identity treatment

### `StatusChip`

Use for:
- report status
- record status

Variants needed:
- created
- processing
- unreviewed
- reviewed
- failed
- pending
- inferred

Responsibilities:
- consistent uppercase label treatment
- consistent color semantics

### `SectionEyebrow`

Use for:
- comparison section labels
- small page labels

Responsibilities:
- uppercase micro-label rhythm
- avoids repeating raw library-text styling ad hoc

### `SurfaceCard`

Use for:
- record cards
- info panels
- empty/blocked/not-found surfaces when appropriate

Responsibilities:
- product-specific surface treatment
- border/shadow/background consistency

### `MetadataLine`

Use for:
- report metadata rows
- record metadata text clusters

Potential value:
- keeps timing/operator/count formatting consistent

## Reports List Components

### `ReportsListScreen`

Responsibilities:
- page title/subtitle zone
- list state branching
- hands off row rendering to a child component

Should branch between:
- loading
- empty
- populated

### `ReportsListHeader`

Responsibilities:
- title
- subtitle
- no blocked integration note placement here

### `ReportsListContainer`

Responsibilities:
- list framing surface
- row spacing/dividers

Decision note:
- do not let a stock table component dictate the visual composition

### `ReportsListRow`

Responsibilities:
- report id
- status
- started/completed timing
- operator
- bottle count
- link affordance

Each row should receive a screen-ready view model, not raw shared types if avoidable.

### `ReportsEmptyScreen`

Responsibilities:
- empty-state message
- consistent family with populated list

## Report Detail Components

### `ReportDetailScreen`

This is the central screen component.

Responsibilities:
- overall detail-page composition
- state-based branching
- deciding which sub-panels are present

States it must support:
- created
- processing
- unreviewed
- reviewed
- comparison emphasis
- failed emphasis
- blocked
- not found

It should not:
- directly own every piece of markup for every variant

### `ReportHeader`

Responsibilities:
- report id/title
- report status
- top metadata

Must support:
- created
- processing
- unreviewed
- reviewed

Blocked/not-found may bypass this component if the approved screen is structurally simpler.

### `ReportMetadataBar`

Responsibilities:
- started time
- completed time
- operator
- progress count if applicable

### `ReportProgressPanel`

Responsibilities:
- processing-state progress presentation
- ready-for-review transition cues

### `ReportRecordList`

Responsibilities:
- vertical list of record cards
- spacing rhythm

### `ReportRecordCard`

Responsibilities:
- outer record composition
- status treatment
- media area
- metadata area
- error block placement
- review control placement

This should be the main reusable record primitive.

### `ReportRecordMedia`

Responsibilities:
- actual image
- missing-image fallback
- failed-image treatment

### `ReportRecordSummary`

Responsibilities:
- bottle name
- category
- UPC
- volume
- badges

### `ReportRecordErrorPanel`

Responsibilities:
- failed-record error message presentation
- error code
- calm operational styling

### `ReportReviewControls`

Responsibilities:
- product match control
- fill-level control

Must not own:
- final submit action

### `BottleMatchControl`

Responsibilities:
- local search query
- search results or select state
- chosen bottle display

### `FillTenthsControl`

Responsibilities:
- discrete 0 through 10 selection
- current selected value

This component matters a lot because it is a core behavioral contract with the backend.

### `ReportReviewActionBar`

Responsibilities:
- one report-level review submit action
- disabled and loading states

Must not render:
- per-record submit buttons

### `ReportComparisonPanel`

Responsibilities:
- original model output side
- final corrected values side
- corrected-field emphasis

Likely subcomponents:
- `ComparisonColumn`
- `ComparisonField`

### `ReportBlockedScreen`

Responsibilities:
- blocked-state explanation
- readiness note
- same product family

### `ReportNotFoundScreen`

Responsibilities:
- not-found message
- same product family

## View-Model Components Versus Helpers

Not everything should be a React component.

The following should likely be helpers instead:
- report status display mapping
- record status display mapping
- report metadata formatting
- comparison field extraction
- empty/loading/blocked copy selection

Suggested files:
- `features/reports/view-models/report-list-view.ts`
- `features/reports/view-models/report-detail-view.ts`
- `features/reports/view-models/report-comparison-view.ts`

## Screen-To-Component Matrix

### Entry

- `PublicShell`
- `PublicTopBar`
- `EntryScreen`

### Reports List

- `WorkbenchShell`
- `ReportsListScreen`
- `ReportsListHeader`
- `ReportsListContainer`
- `ReportsListRow`

### Reports Empty

- `WorkbenchShell`
- `ReportsEmptyScreen`

### Created

- `WorkbenchShell`
- `ReportDetailScreen`
- `ReportHeader`
- `ReportMetadataBar`

### Processing

- `WorkbenchShell`
- `ReportDetailScreen`
- `ReportHeader`
- `ReportProgressPanel`

### Unreviewed

- `WorkbenchShell`
- `ReportDetailScreen`
- `ReportHeader`
- `ReportRecordList`
- `ReportRecordCard`
- `ReportRecordMedia`
- `ReportRecordSummary`
- `ReportReviewControls`
- `ReportReviewActionBar`

### Reviewed

- `WorkbenchShell`
- `ReportDetailScreen`
- `ReportHeader`
- `ReportRecordList`
- `ReportRecordCard`
- reviewed-state summary and/or final-values presentation

### Comparison

- `WorkbenchShell`
- `ReportDetailScreen`
- `ReportHeader`
- `ReportComparisonPanel`

### Failed

- `WorkbenchShell`
- `ReportDetailScreen`
- `ReportHeader`
- `ReportRecordList`
- `ReportRecordCard`
- `ReportRecordErrorPanel`
- `ReportReviewControls`
- `ReportReviewActionBar`

### Blocked

- `WorkbenchShell`
- `ReportBlockedScreen`

### Not Found

- `WorkbenchShell`
- `ReportNotFoundScreen`

## First-Build Priority

Build in this order:

1. shell components
2. shared primitives
3. reports list components
4. detail shell components
5. record card and review controls
6. comparison and failed emphasis specialization

That order gets us to visual progress quickly without painting ourselves into a routing or styling corner.
