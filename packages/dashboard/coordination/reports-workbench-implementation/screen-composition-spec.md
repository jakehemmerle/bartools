# Screen Composition Spec

This document locks the screen-by-screen blueprint for the BARBACK web reports workbench.

It exists because strong tokens and strong state rules are still not enough if block order, responsive collapse, and copy remain mushy.

This is the document that answers:

If two competent engineers build the same screen, what exact shape should they converge on?

## Relationship To Other Enforcement Docs

Use this doc together with:
- `visual-token-spec.md`
- `state-visibility-matrix.md`
- `review-evidence-protocol.md`

Those documents define:
- visual language
- allowed actions and state visibility
- proof requirements

This document defines:
- composition
- hierarchy
- responsive behavior
- locked copy

## Locked Decisions In This Pass

These decisions are now closed:

1. Reports list uses custom BARBACK rows, not a stock data-table component.
2. Created state does not render a fake extracted-records section.
3. Blocked state includes a disabled `Submit Review` button plus a `Back to Reports` action.
4. Unreviewed uses a scrubber or rail-like tenths selector.
5. Failed emphasis uses explicit `0` through `10` tenths buttons.
6. Reviewed renders read-only resolved cards.
7. Comparison emphasis renders a single hero comparison card rather than a generic diff page.

## Global Composition Rules

### Breakpoints

Use these planning breakpoints:
- desktop: `1280px` and wider
- tablet: `768px` to `1279px`
- narrow: below `768px`

### Shared Workbench Shell Rules

Across list and detail screens:
- use a top bar, not a sidebar
- keep the BARBACK wordmark visible in the top bar
- keep the main content inside a deliberate centered canvas
- keep decorative chrome minimal
- avoid floating utility widgets, search bars, and secondary nav

### Header Rules

Entry uses a centered hero stack.

List and detail use:
- top bar first
- main canvas second
- editorial page header before dense content

### Copy Rules

Locked copy means:
- preserve the string exactly unless backend truth forces a change
- do not embellish it to make the screen feel busier

If a mockup contains fake-process nonsense, this spec replaces it with product-truthful copy.

## Entry Blueprint

Reference:
- `golden-set-approved/reports_workbench_entry`

### Block Order

1. centered wordmark cluster
2. hero headline
3. short supporting sentence
4. primary CTA
5. quiet readiness note

### Locked Copy

- wordmark: `BARBACK`
- headline: `Reports Workbench`
- supporting copy: `Open recent reports and inspect records from desktop.`
- CTA: `Open Reports`
- quiet note: `Live access requires venue and user context.`

### Responsive Rules

- keep the composition vertically centered at all widths
- hide the large ghost-border ambient frame on narrow widths
- keep the CTA directly beneath the supporting copy
- never add auth controls, footer links, or extra onboarding explainer text

### Must Not

- add sign-in or sign-up links
- add product marketing cards
- add feature bullets for unsupported surfaces

## Reports List Blueprint

Reference:
- `golden-set-approved/reports_list`

### Block Order

1. workbench top bar with back action and wordmark
2. editorial header block
3. metadata-style list header row
4. custom report row stack

### Locked Copy

- page title: `Reports`
- supporting copy: `Review recent reports and open one to inspect records.`
- list headers:
  - `Report ID`
  - `Status`
  - `Operator`
  - `Started`
  - `Completed`
  - `Bottle Count`

### Row Composition

Each row should appear in this order:

1. report id
2. status chip
3. operator
4. started timestamp
5. completed timestamp
6. bottle count

Visible behavior:
- the row is the click target
- a left-edge copper indicator may appear on hover
- hover treatment should be tonal, not flashy

Implementation lock:
- use custom row composition with CSS grid or equivalent
- do not use a stock table component for the rendered UI

### Responsive Rules

On desktop:
- show metadata header row
- show all six row fields

On tablet:
- keep custom row layout
- allow `Completed` to collapse before `Started`

On narrow:
- hide the metadata header row
- collapse report id and timestamps before bottle count
- preserve status, operator, and bottle count as the most readable pieces
- do not devolve into a generic stacked card with extra badges everywhere

### Must Not

- add search
- add pagination
- add export
- add per-row action menus by default

## Reports Empty Blueprint

Reference:
- `golden-set-approved/reports_list_empty_state`

### Block Order

1. same top bar as reports list
2. same editorial header as reports list
3. centered empty-state panel
4. icon
5. empty-state title
6. empty-state body

### Locked Copy

- page title: `Reports`
- empty-state title: `Reports`
- empty-state body: `No reports found. Recent reports will appear here once they are available.`

### Responsive Rules

- keep the empty panel centered within the list canvas
- allow the panel to narrow naturally on tablet and narrow widths
- do not replace the empty panel with a tiny inline placeholder message

### Must Not

- add troubleshooting text
- imply error or breakage
- introduce a different shell family from the populated reports list

## Report Created Blueprint

Reference:
- `golden-set-approved/report_detail_created`

### Block Order

1. workbench top bar
2. report header
3. status chip
4. minimal timing metadata
5. created-state explanation slab

### Locked Copy

- status chip: `Created`
- explanation: `This report has been created. Processing has not started yet.`

### Responsive Rules

- keep the explanation slab directly beneath the header
- do not add a second faux records section on narrow or desktop

### Must Not

- mention external ledgers
- mention handshakes, protocols, or initialization theater
- render placeholder extracted records
- render any review controls

## Report Processing Blueprint

Reference:
- `golden-set-approved/report_detail_processing`

### Block Order

1. workbench top bar
2. report identity slab
3. processing status chip
4. progress strip
5. passive records list

### Locked Copy

- status chip: `Processing`
- progress label: `Progress`
- pending row label: `Processing...`

### Passive Records List Rules

The processing screen may show:
- completed or inferred records that already exist
- pending rows that still read `Processing...`

The processing screen may not show:
- product match controls
- fill controls
- submit review actions

### Responsive Rules

- header slab may stack vertically on tablet and narrow widths
- progress remains full width beneath the header slab
- pending rows remain visually quieter than inferred rows

## Report Unreviewed Blueprint

Reference:
- `golden-set-approved/report_detail_unreviewed_revised`

### Block Order

1. centered workbench top bar with back action
2. report title and status chip
3. metadata slab
4. vertical record-card stack
5. report-level action area

### Locked Copy

- status chip: `Unreviewed`
- field label: `Product Match`
- field label: `Observed Fill Level`
- action label: `Submit Review`

### Record Card Composition

Each record card should render in this order:

1. outer card shell
2. left media and summary slab
3. category label
4. bottle/product title
5. UPC and size metadata
6. right controls slab
7. product match control
8. observed fill level control

### Fill Control Rule

For unreviewed and inferred records:
- use the rail or scrubber-style tenths control
- display discrete values `0` through `10`
- show the currently selected value prominently

Do not:
- label it as a percentage
- accept decimal entry

### Responsive Rules

On desktop:
- media/summary slab sits left
- controls slab sits right

On narrow:
- media/summary slab stacks above controls
- submit button stretches comfortably rather than staying tiny and right-aligned

## Report Reviewed Blueprint

Reference:
- `golden-set-approved/report_detail_reviewed_revised`

### Block Order

1. workbench top bar
2. report header with reviewed chip
3. right-aligned metadata cluster
4. read-only record-card grid

### Locked Copy

- status chip: `Reviewed`
- section label: `Original Model Output`
- section label: `Final Corrected Values`

### Record Card Composition

Each reviewed card should render:

1. outer card shell
2. inner split comparison block
3. original model output column
4. final corrected values column

Corrected values should feel final.
Original values should feel historical.

### Responsive Rules

On desktop:
- cards may appear in a two-column grid
- each card keeps original and final values side by side

On narrow:
- grid collapses to one column
- inside each card, original appears above final

### Must Not

- render editable controls
- render submit actions
- make original and final values look equally current

## Report Comparison Emphasis Blueprint

Reference:
- `golden-set-approved/report_detail_comparison_emphasis_final`

### Block Order

1. workbench top bar
2. concise report header with reviewed chip
3. single hero comparison card
4. record header row
5. split original-versus-final panels

### Locked Copy

- status chip: `Reviewed`
- panel title: `Original Model Output`
- panel title: `Final Corrected Values`
- fill labels:
  - `Original Fill Level`
  - `Final Fill Level`

### Record Header Composition

The comparison card header should include:

1. icon or image token
2. bottle name
3. category

### Responsive Rules

On desktop:
- original and final panels sit side by side

On narrow:
- original appears first
- final appears second
- field groups keep their internal order

### Must Not

- add edit controls
- add approval or export chrome
- turn into a generalized diff viewer

## Report Failed Emphasis Blueprint

Reference:
- `golden-set-approved/report_detail_failed_emphasis_final`

### Block Order

1. workbench top bar
2. report header with unreviewed chip
3. vertical failed-record stack
4. report-level submit area

### Locked Copy

- status chip: `Unreviewed`
- failed badge: `Failed`
- field label: `Product Match`
- field label: `Fill Level (Tenths)`
- action label: `Submit Review`

### Failed Record Composition

Each failed record card should render:

1. outer card shell
2. left-edge error strip
3. media panel with failure treatment or placeholder
4. right content stack
5. bottle title
6. failed badge
7. restrained error block with code and explanation
8. controls grid
9. product match control
10. fill-level buttons

### Fill Control Rule

For failed emphasis:
- use explicit `0` through `10` button choices
- allow wrapping on narrow widths
- keep the current selection visually distinct

### Responsive Rules

On desktop:
- media occupies roughly one third
- content occupies the remaining width
- controls appear as a two-column grid

On narrow:
- media stacks above content
- controls collapse to a single-column flow
- fill buttons wrap cleanly without horizontal scrolling

### Must Not

- add recapture actions
- add per-record submit buttons
- use emergency or outage tone

## Report Blocked Blueprint

Reference:
- `golden-set-approved/report_detail_blocked_state`

### Block Order

1. workbench top bar
2. centered blocked-state panel
3. blocked icon
4. blocked headline
5. explanation copy
6. divider
7. disabled primary button
8. secondary navigation button

### Locked Copy

- headline: `Access Unavailable`
- body: `Live report access requires venue and user context. Review submission requires user context.`
- disabled button: `Submit Review`
- secondary button: `Back to Reports`

### Responsive Rules

- keep the blocked panel vertically centered
- keep both actions full width within the panel
- do not render report-specific metadata above the panel

### Must Not

- render fake report data
- render interactive review controls
- frame the state as a crash

## Report Not Found Blueprint

Reference:
- `golden-set-approved/report_detail_not_found_state`

### Block Order

1. workbench top bar
2. centered not-found panel
3. icon or ambient symbol
4. headline
5. body copy
6. back action

### Locked Copy

- headline: `Report Not Found`
- body: `This report could not be found. Return to reports and choose another report.`
- action: `Back to Reports`

### Responsive Rules

- keep the content centered and calm
- hide the ambient background shape on narrow widths

### Must Not

- fabricate fallback report data
- render generic stack traces or crash copy

## Composition Review Checklist

After any screen implementation pass, ask:

1. Did the screen follow the locked block order?
2. Did responsive collapse happen in the order this spec expects?
3. Did we preserve the locked copy or consciously replace mockup nonsense with product-truthful copy?
4. Did a generic library layout sneak back in because it was easier?
5. If someone only read this document, would they still build the same screen family we intend?
