# Stitch Prompt V3: BARTOOLS Web Reports Workbench

Use the following prompt in a fresh Stitch project.

```text
Design a desktop web reports workbench for BARTOOLS.

This is a fresh project.
Do not inherit assumptions from prior Stitch attempts.
Do not reuse prior Stitch information architecture.
Do not reuse prior Stitch page naming.
Do not reuse prior Stitch utility chrome.
Do not reuse prior Stitch metrics.
Do not reuse prior Stitch action vocabulary.
Do not reuse prior Stitch “luxury dashboard” instincts.

The design must defer to:
- the BARTOOLS mobile app for design
- the backend reports workflow for functionality

Primary visual reference:
https://stitch.withgoogle.com/projects/18269116219514012906

Important interpretation rule:
Treat the linked Stitch project as visual reference only.
It is allowed to influence:
- overall product feel
- typography mood
- surface treatment
- color language
- density
- brand tone
- component attitude

It is not allowed to influence:
- information architecture
- screen count
- navigation model
- actions
- metrics
- product scope
- utility areas
- footer links
- sidebars
- report naming
- review workflow complexity

If the linked project or any prior related project contains anything that conflicts with this prompt, this prompt wins.

If the mobile visual language and common web dashboard conventions conflict, follow mobile.
If the backend functional truth and a richer imagined web UX conflict, follow backend.
If you are unsure whether something is allowed, omit it.


==================================================
0. MISSION
==================================================

Design only a narrow desktop companion surface for reviewing reports.

This is not:
- a general dashboard
- a command center
- an admin console
- a control room
- a business intelligence surface
- a marketing site
- a signup flow
- a settings application
- a management console
- an inventory suite
- a multi-product workspace

This is:
- a report review desk
- a quiet operational workbench
- a desktop reading and inspection surface
- a BARTOOLS companion interface

The product job is extremely narrow:
- open reports
- inspect report state
- inspect report records
- compare original model output against corrected final values
- understand failures
- prepare review decisions

The web surface must not imply broader authority than the backend actually exposes.
The web surface must not create any new product obligations for mobile or backend.
The web surface must feel subordinate to the existing BARTOOLS product family, not like a new platform.


==================================================
1. SOURCE OF TRUTH HIERARCHY
==================================================

There are exactly two sources of truth.

Design source of truth:
- BARTOOLS mobile app
- the linked Stitch project only as visual reference

Functional source of truth:
- backend reports workflow only

Do not use:
- generic enterprise dashboard patterns
- generic admin panel patterns
- startup landing page patterns
- SaaS analytics patterns
- control-room patterns
- moderation-console patterns

Do not assume hidden capabilities beyond what is listed below.
Do not design for roadmap features.
Do not design “future state” capabilities.
Do not design “nice to have” utilities.


==================================================
2. EXACT PRODUCT SCOPE
==================================================

The only product surfaces allowed are:
- entry surface
- reports list
- reports list empty state
- report detail
- report detail state variants
- unavailable / blocked state
- not found state

Nothing else is allowed.

There is no:
- inventory page
- low stock page
- settings page
- team page
- onboarding page
- sign-in page
- sign-up page
- password reset page
- venue management page
- location management page
- exports center
- analytics page
- notification inbox
- support center
- logs view
- profile page

Do not even hint at these as near-adjacent active destinations.


==================================================
3. EXACT SCREEN COUNT
==================================================

Produce exactly these screens and no others:

1. Entry surface
2. Reports list
3. Reports list empty state
4. Report detail - created
5. Report detail - processing
6. Report detail - unreviewed
7. Report detail - reviewed
8. Report detail - failed emphasis
9. Report detail - original vs corrected comparison emphasis
10. Unavailable / blocked state
11. Not found / missing report state

Do not produce:
- alternate nav concepts
- extra explorations
- component gallery pages
- design system pages
- “bonus” screens
- future state screens
- optional admin screens
- mobile responsive variants
- tablet variants

These 11 screens are the entire deliverable.


==================================================
4. UNDERLYING TEMPLATE RULE
==================================================

There are only three structural templates.

Template A:
- entry surface

Template B:
- reports list
- reports list empty state

Template C:
- report detail - created
- report detail - processing
- report detail - unreviewed
- report detail - reviewed
- report detail - failed emphasis
- report detail - original vs corrected comparison emphasis
- unavailable / blocked state
- not found / missing report state

Important rule:
All detail-related states must share the same structural skeleton.

That means:
- same top shell
- same page frame
- same report-header structure
- same record-list structure
- same record-card family
- same placement of review controls when applicable

It must not mean:
- new summary modules per state
- new navigation per state
- new action bars per state
- different page architecture per state
- different side panels per state
- a dashboard variant for one state and a document variant for another

Only the stateful content changes.
The page architecture does not.


==================================================
5. BACKEND FUNCTIONAL TRUTH
==================================================

The backend truth is the only allowed functional truth.

Core entity:
- report

Secondary entity:
- report record

Supporting entities:
- bottle search result
- venue location

Allowed report statuses:
- created
- processing
- unreviewed
- reviewed

Allowed report record statuses:
- pending
- inferred
- failed
- reviewed

Report list fields available:
- id
- startedAt
- completedAt
- userId
- userDisplayName
- bottleCount
- status

Report detail fields available:
- id
- startedAt
- completedAt
- userId
- userDisplayName
- status
- bottleRecords[]

Per-record fields available:
- id
- imageUrl
- bottleName
- category
- upc
- volumeMl
- fillPercent
- corrected
- status
- errorCode
- errorMessage
- originalModelOutput
- correctedValues

Per original/corrected model output:
- bottleName
- category
- upc
- volumeMl
- fillPercent

Progress fields available:
- id
- status
- photoCount
- processedCount

Bottle search result fields available:
- id
- name
- category
- upc
- volumeMl

Venue location fields available:
- id
- name
- createdAt

Review payload shape:
- userId
- records[]
- each record contains:
  - id
  - bottleId
  - fillTenths

This review payload means the editable decisions are only:
- bottle match
- fill level in tenths / 10% increments

Nothing broader is supported.


==================================================
6. DATA-TO-UI MAPPING RULE
==================================================

This is the most important rule in the prompt.

Every visible data point, badge, chip, status, action, control, label, and page concept must map directly to:
- a backend field listed above
- a backend status listed above
- a backend route implied by reports list / report detail / bottle search / review submission

If a concept cannot be mapped directly, it must not appear.

Examples of valid visible things:
- Report ID
- Started
- Completed
- Operator
- Bottle Count
- Status
- Original model output
- Final corrected values
- Failed record
- Error code
- Error message
- Fill percent
- Fill level choice
- Bottle search result choice

Examples of invalid visible things:
- Variance
- Expected value
- Total items summary tiles
- Confidence score
- Shift diagnostics
- System activity log
- Resolve all
- Manual entry
- Adjust inventory
- Review context settings
- Export
- Support
- Documentation
- Status page links
- Notifications
- Profile avatars
- camera labels
- station tags not backed by fields
- named audit titles
- performance summaries

If in doubt, omit it.


==================================================
7. EXPLICITLY FORBIDDEN ELEMENTS
==================================================

The following must not appear anywhere in the deliverable.

Forbidden product areas:
- inventory
- low stock
- settings
- auth flows
- onboarding
- team management
- analytics
- support
- logs
- documentation
- notifications
- exports hub
- profile management
- venue switching
- location management

Forbidden page furniture:
- persistent sidebar
- nav rail
- footer utility links
- footer status/documentation/support links
- profile avatar
- user portrait
- bartender portrait
- venue portrait
- ambience photography
- stock photography
- decorative bar photography
- utility icon cluster
- notifications bell
- search in the shell
- filter control in the shell

Forbidden actions:
- Export
- Download
- Resolve All
- Approve All
- Ignore
- Manual Entry
- Adjust Inventory
- Flag For Review
- Accept Edit
- Reject
- Escalate
- Reopen Report
- Modify Venue Context
- Review Context Settings

Forbidden metrics:
- variance
- expected value
- total items summary card
- successful count
- failed count summary tile
- confidence score summary
- reconciliation numbers
- inventory dollars
- depletion math
- ounces math
- expected vs calculated
- anomaly score
- weight anomaly

Forbidden terminology:
- Inventory Report
- Zone Audit
- Main Bar Audit
- End of Shift Reconciliation
- command center
- operator intelligence
- tactical insight
- all venues
- platform
- systems
- ecosystem
- diagnostics
- reconciliation
- variance target

Forbidden visual idioms:
- enterprise dashboard bento metrics
- moderation console side panel
- audit-log table
- issue triage layout
- executive summary strip
- command center header
- glossy enterprise widgets


==================================================
8. NEGATIVE EXAMPLES FROM PRIOR FAILED PASSES
==================================================

Do not reproduce any of these mistakes from prior attempts.

Do not create a reports list with:
- footer links such as Status / Documentation / Support
- fake report IDs like RPT-2023-11-04-A if backend IDs are otherwise opaque
- wrong statuses like VERIFIED or PENDING when backend statuses are created / processing / unreviewed / reviewed
- back links in the list shell if they do not make sense in the product flow

Do not create a report detail with:
- a title like Main Bar Audit
- a title like End of Shift Reconciliation
- a metadata row using invented labels like Zone 1
- summary cards like Total Items, Variance Target, Expected Value, Auditor
- record-level controls labeled Verified Brand using free text entry
- synthetic failure concepts like Weight Variance Anomaly
- batch buttons like Resolve All
- export buttons
- system activity log sections
- notification icons
- profile avatar at top right

Do not create an unavailable state with:
- Review Context Settings
- System Diagnostics
- shift language
- utility footer links

Do not create a design brief that:
- uses Inter as the primary body font
- invents a new design-brand name like Operator’s Edition
- invents a new design-philosophy label like Night Steward
- reframes the product as a separate web identity


==================================================
9. EXACT VISUAL SOURCE OF TRUTH
==================================================

The web surface must feel like BARTOOLS mobile translated to desktop.

Typography:
- major headings: Newsreader
- body copy: Manrope
- labels / metadata / uppercase utility text: Space Grotesk

Do not use Inter for body copy.
Do not use Inter for title text.
Do not use Inter as a fallback primary voice.
If you need a fallback stack, it should still preserve the same role split:
- serif display
- humanist/clean sans body
- geometric technical label font

Color direction:
- dark-first
- charcoal / ink surfaces
- warm copper / brass primary accent
- controlled green for confirmed/reviewed
- controlled red for failed
- warm brown-gray outlines and muted text

Use the mobile color spirit directly.
Guidance tokens:
- background: #131313
- surfaceContainerLowest: #0E0E0E
- surfaceContainerLow: #1C1B1B
- surfaceContainer: #20201F
- surfaceContainerHigh: #2A2A2A
- surfaceContainerHighest: #353535
- primary: #FFB782
- primaryContainer: #C7804A

Material direction:
- tonal layering
- small crisp radii
- sharp edges
- premium restraint
- quiet depth

Avoid:
- soft bubbly cards
- blue enterprise accents
- ornamental luxury clutter
- cyberpunk styling
- harsh neomorphism
- giant glassmorphism gimmicks

The mood should come from:
- type hierarchy
- spacing
- dark surface layering
- editorial composition
- disciplined copper use

The mood should not come from:
- decorative imagery
- invented storytelling graphics
- giant ornamental icons
- fake photography


==================================================
10. GLOBAL SHELL SPECIFICATION
==================================================

There is one shell.

Allowed shell elements:
- BARTOOLS wordmark or simple brand mark
- one restrained top bar
- one optional back link when appropriate

The shell must not contain:
- persistent sidebar
- secondary navigation
- utility footer
- action footer
- support links
- settings links
- documentation links
- status links
- profile menu
- notifications
- search
- filter icon
- export icon
- avatar

The shell should be visually quiet.
The shell should get out of the way.


==================================================
11. ENTRY SURFACE SPECIFICATION
==================================================

This is not a landing page.
This is not a homepage.
This is not product marketing.

It is a sparse launch surface for the reports workbench.

Allowed content:
- BARTOOLS identity
- one heading
- one short paragraph
- one primary action leading into reports
- one calm note about live access requiring venue and user context

Forbidden content:
- multi-card feature sections
- benefits grid
- testimonials
- statistics
- product screenshots
- secondary CTAs
- sign-up/sign-in framing
- pricing framing
- product comparison content

Copy tone:
- literal
- quiet
- minimal

Do not say:
- analyzing operational reports
- tactical insight
- command center
- operational systems

Do say something closer to:
- Review reports from desktop
- Open the reports workbench
- Live access requires venue and user context


==================================================
12. REPORTS LIST SPECIFICATION
==================================================

The reports list is the main entry into the real app.

It must contain:
- page title
- one short descriptive sentence
- one list or table

It must not contain:
- search field
- filters
- metrics
- top summary strip
- charts
- KPI blocks
- global actions
- footer utility links

Preferred columns:
- Report ID
- Status
- Operator
- Started
- Completed
- Bottle Count

Status labels must use exact backend language:
- created
- processing
- unreviewed
- reviewed

Do not rename them.
Do not soften them.
Do not replace them with:
- verified
- pending
- complete
- active
- reconciled

The reports list description must stay narrow.
Do not use:
- manage reports
- analyze reports
- operational intelligence
- across all venues

Prefer language like:
- Review recent reports
- Open a report to inspect records and status

Interaction model:
- row click is enough
- or one minimal single-purpose “view” affordance

Do not add:
- multiple row actions
- actions column with tool cluster
- hover utility controls


==================================================
13. REPORT DETAIL PAGE SPECIFICATION
==================================================

The detail page is the core product surface.

The page header may contain only:
- back to reports
- report ID
- report status
- started time
- completed time
- operator name if available
- location name only if treated as supporting metadata and only if present
- progress only when the backend state supports it

The page header must not contain:
- invented report title
- invented audit name
- invented zone name
- summary cards
- total items tiles
- expected value
- variance
- auditor card
- export
- resolve all
- notifications
- profile area

The body of the page must be:
- a vertical stack of record cards

Do not add:
- summary bento row
- right rail
- left rail
- sticky action tray
- moderation dashboard
- activity log
- diagnostics block


==================================================
14. REPORT RECORD CARD SPECIFICATION
==================================================

Each record card must be built from the actual record fields.

Allowed record-card content:
- image thumbnail from imageUrl if present
- placeholder state if image is missing
- bottleName
- category
- upc
- volumeMl
- fillPercent
- record status
- failed block using errorCode and errorMessage if failed
- original model output block if present
- corrected final values block if present
- review controls if report is unreviewed

Not allowed inside a record card:
- camera IDs
- photo index badges unless directly tied to a backend field
- station labels
- variance class
- expected vs actual
- confidence gauge
- issue severity
- manual entry button
- adjust inventory button
- ignore button
- triage actions

Layout guidance:
- image left
- content right
- review controls inline below or beside content in a restrained way
- no detached inspector pane

The card should feel like:
- a dark document row
- easy to scan
- quietly precise

It should not feel like:
- a moderation case file
- a support ticket
- a BI tile


==================================================
15. REVIEW CONTROL SPECIFICATION
==================================================

The review model is extremely narrow.

For unreviewed reports, each record may present:
- bottle selection affordance based on search results
- fill level selection in tenths

This should feel like:
- selecting a bottle match
- selecting a 10% increment fill level

It should not feel like:
- typing arbitrary edits into a form
- reauthoring the whole record
- freeform moderation

Therefore:
- do not use freeform text fields labeled Verified Brand or similar as the primary correction mechanism
- do not imply arbitrary product renaming
- do not imply arbitrary category editing
- do not imply direct inventory mutation

Use controls that imply:
- choose one bottle result
- choose one fill level

Do not use controls that imply:
- custom schema editing
- manual override of the entire system
- continuous slider precision
- ounce-level measurement

Page-level action:
- one restrained final review submit action is allowed

No other page-level action is allowed except back to reports.


==================================================
16. STATE VARIANT SPECIFICATION
==================================================

Report detail - created:
- same detail template
- report exists
- status is created
- progress should not be dramatized
- records may feel pending or not yet ready

Report detail - processing:
- same detail template
- status is processing
- progress may use photoCount and processedCount only
- records may show pending, inferred, and failed
- no animated dashboard spectacle

Report detail - unreviewed:
- same detail template
- status is unreviewed
- review controls visible
- calm review emphasis

Report detail - reviewed:
- same detail template
- status is reviewed
- no active editing emphasis
- historical and settled tone

Report detail - failed emphasis:
- same detail template
- failed records visually easy to notice
- use errorCode and errorMessage
- no invented failure taxonomy

Report detail - comparison emphasis:
- same detail template
- original model output and corrected final values clearly separated
- use layout and label, not gimmicks

Across all detail variants:
- no summary cards
- no synthetic metrics
- no alternate shell
- no alternate report names
- no extra actions


==================================================
17. UNAVAILABLE / BLOCKED STATE SPECIFICATION
==================================================

This state communicates exactly one thing:
- live report access or review submission cannot proceed until required venue/user context exists

Good allowed ideas:
- calm lock or muted unavailable visual
- one short explanation
- one disabled action if truly necessary
- one path back to reports

Forbidden ideas:
- system diagnostics
- context settings
- operational shift
- admin remedy flow
- support escalation
- debugging language

Allowed tone:
- Live report access requires venue and user context.
- Review submission requires user context.

Forbidden tone:
- Backend integration coming soon.
- Mock mode.
- Under development.
- Log in to an operational shift.


==================================================
18. NOT FOUND SPECIFICATION
==================================================

This is a minimal detail-template variant.

Allowed content:
- report shell
- not found message
- back to reports

Forbidden content:
- troubleshooting steps
- support links
- status page links
- diagnostics


==================================================
19. COPY RULES
==================================================

All copy must be:
- concise
- literal
- operational
- calm
- product-facing

Preferred vocabulary:
- Reports
- Report
- Report ID
- Record
- Original model output
- Final corrected values
- Failed record
- Review
- Started
- Completed
- Operator
- Bottle count

Forbidden vocabulary:
- Inventory Reports
- Audit
- Reconciliation
- Variance
- Diagnostics
- Tactical insight
- Operational systems
- Command center
- Platform
- Ecosystem
- Unified venue control

Do not write brand copy that sounds like a startup pitch.
Do not write copy that sounds like a luxury hospitality ad.
Do not write copy that sounds like an enterprise dashboard.


==================================================
20. DELIVERABLE EXPECTATIONS
==================================================

Provide exactly:
- 11 screens
- one coherent visual system across them
- one clear desktop adaptation of BARTOOLS mobile

Do not provide:
- system manifesto
- strategy notes
- component appendix
- alternate explorations
- extra variants

The output should be implementation-directed.
A frontend engineer should be able to look at it and know:
- what the screens are
- what the allowed controls are
- what the shell is
- what the design language is
- what not to build


==================================================
21. EXACT ROUTE MODEL
==================================================

Model the web product as if it has only these route-level destinations:

- `/`
- `/reports`
- `/reports/:reportId`
- `/reports/:reportId` in created state
- `/reports/:reportId` in processing state
- `/reports/:reportId` in unreviewed state
- `/reports/:reportId` in reviewed state
- `/reports/:reportId` in failed-emphasis state
- `/reports/:reportId` in comparison-emphasis state
- `/reports/unavailable` or equivalent blocked-state variant
- `/reports/:reportId` not found variant

Interpretation rule:
these are state variants, not separate products.

There is no route model for:
- `/inventory`
- `/settings`
- `/low-stock`
- `/analytics`
- `/support`
- `/logs`
- `/profile`
- `/venues`
- `/locations`

Do not visually imply those routes exist.


==================================================
22. EXACT PAGE TITLE RULES
==================================================

Use exact page-title logic.

Entry surface:
- may use a title like `Reports Workbench`
- or `Review Reports`

Reports list:
- title should be `Reports`

Reports empty:
- title should still be `Reports`

Report detail:
- primary identity should be `Report <id>` or a similarly literal report-ID-first heading

Do not use:
- Main Bar Audit
- Zone B Audit
- End of Shift Reconciliation
- Nightly Count
- Service Summary
- Closeout Review
- any invented poetic or operational title

Reason:
the backend gives us report identity as report ID, not as a named narrative object.


==================================================
23. EXACT COMPONENT INVENTORY
==================================================

The design system for this web deliverable should only need the following component families:

Global shell components:
- wordmark / brand label
- top bar
- back link

Reports list components:
- page heading
- page description
- report list table or list
- status chip
- empty state block

Report detail components:
- report header
- metadata row
- progress indicator that uses only photoCount and processedCount
- record card
- failed record block
- original model output block
- corrected values block
- review controls block
- final submit action
- unavailable / blocked message block
- not found message block

Primitive components:
- buttons
- chips
- text fields only if used as search-input affordance
- selection controls
- empty / blocked / not found state modules

Do not invent additional component families such as:
- KPI card
- stat card
- insight panel
- activity log
- diagnostics card
- profile chip
- notification center
- utility footer
- assistant panel
- AI summary module


==================================================
24. SCREEN-BY-SCREEN LAYOUT SKELETONS
==================================================

Use these exact skeletons as the intended composition model.

Entry surface skeleton:
- top region: minimal brand mark
- middle region: one heading, one paragraph, one primary CTA
- bottom region: one optional line of blocked/live-access context
- no side columns
- no card grid
- no floating utility controls

Reports list skeleton:
- top region: page title and one short line of copy
- middle region: one list/table block
- bottom region: nothing ornamental
- no footer nav
- no side modules
- no summary strip

Reports empty skeleton:
- same as reports list skeleton
- table/list area replaced by one empty-state block

Report detail skeleton:
- top bar: brand + back link only
- detail header: report ID, status, metadata, progress when relevant
- content body: stacked record cards
- bottom action region: only a single final action if allowed in the state
- no sidebars
- no multi-column dashboard summary zone above the records

Blocked state skeleton:
- same shell as detail
- center-aligned or content-centered blocked-state block inside the same page family
- one calm message
- optional disabled primary action
- path back to reports

Not found skeleton:
- same shell as detail
- minimal message block
- path back to reports


==================================================
25. EXACT REPORT HEADER CONTENT RULE
==================================================

The report header may visually contain only these semantic groups:

Group 1: navigation
- back to reports

Group 2: identity
- Report ID

Group 3: status
- created
- processing
- unreviewed
- reviewed

Group 4: metadata
- Started
- Completed
- Operator
- Location only if present and treated as supporting metadata

Group 5: progress
- photoCount / processedCount only when relevant

Do not add any Group 6.

Specifically do not add:
- summary KPIs
- financial impact
- diagnostics
- category rollups
- success/failure counters
- record-quality gauges


==================================================
26. EXACT RECORD CARD CONTENT ORDER
==================================================

Each record card should present information in this approximate order:

1. image
2. bottle name
3. metadata line
4. record status
5. fill percent
6. failed-state content if applicable
7. original model output if applicable
8. corrected values if applicable
9. review controls if applicable

This order matters because it preserves the operator reading flow:
- identify the bottle
- understand the status
- see the evidence
- act if needed

Do not reorder it into:
- action-first card
- metrics-first card
- moderation-first card
- diagnostics-first card


==================================================
27. EXACT REVIEW CONTROL MODEL
==================================================

The review controls must visually imply a narrow, structured decision process.

Acceptable control patterns:
- search input plus result selection list
- combobox/select for bottle choice
- select / segmented control / discrete stepper for fill level

Unacceptable control patterns:
- freeform textarea
- large editable form with many fields
- rich inline spreadsheet
- moderation action row
- accept/reject matrix
- danger/approval split buttons
- continuous precision slider
- ounce-based measurement control
- scientific lab tool styling

Fill level must visually read as:
- 0.0 to 1.0 in tenths
or
- 0% to 100% in 10% increments

Do not imply:
- 73%
- 21.8 oz
- 420g
- any more precise value than tenths / 10% increments


==================================================
28. STATUS VISUAL LANGUAGE RULE
==================================================

Status treatment should be consistent across list and detail.

created:
- quiet
- low-emphasis
- neutral/copper-adjacent, not celebratory

processing:
- active but restrained
- no spinner circus
- no neon urgency

unreviewed:
- notable and actionable
- should draw attention without panic

reviewed:
- settled
- confirmed
- restrained green is acceptable

failed:
- clearly distinct
- restrained red is acceptable
- must not feel like a catastrophic system outage

Do not invent extra statuses.
Do not merge statuses.
Do not rename statuses.


==================================================
29. TYPOGRAPHIC HIERARCHY SPECIFICATION
==================================================

Use a clear hierarchy that matches mobile.

Suggested role mapping:
- large page titles: Newsreader
- report titles / report ID heading: Newsreader
- standard body sentences: Manrope
- metadata labels: Space Grotesk uppercase
- table headers: Space Grotesk uppercase
- small utility labels: Space Grotesk uppercase

Body copy should not accidentally fall back into an Inter-like voice.
If a block of copy feels too corporate, it is wrong.
If a block of copy feels too literary, it is also wrong.

The desired feeling is:
- editorial but precise
- readable but restrained


==================================================
30. SPACING AND DENSITY SPECIFICATION
==================================================

The design should feel dense enough to be operational, but not cramped.

Use:
- clear vertical rhythm
- dark negative space
- deliberate grouping
- slightly tighter operational density than a marketing page

Do not use:
- giant airy hero spacing that implies landing page composition
- cramped spreadsheet density
- over-separated card grids

Reports list density:
- enough row height to feel premium
- enough compactness to feel like a tool

Record-card density:
- enough breathing room to read
- not so much space that each card becomes a poster


==================================================
31. IMAGE POLICY
==================================================

The only meaningful images in the workbench are report record thumbnails.

If an image is present, it should function as evidence, not decoration.

Do:
- use bottle/report thumbnails
- use a calm missing-image placeholder when needed

Do not:
- use bar interiors
- use portraits
- use atmospheric brand photos
- use bartender hands, cocktails, shelves, candlelight, or lounge scenes
- use decorative illustrations of bottles unless functioning as a clear placeholder

If Stitch is tempted to “make it feel premium” with photography, resist that temptation.
Premium should come from type, composition, and surfaces.


==================================================
32. ALLOWED COPY EXAMPLES BY SCREEN
==================================================

These are examples of acceptable copy tone and content.
You do not need to use these exact strings, but stay in this lane.

Entry surface heading examples:
- Reports Workbench
- Review Reports

Entry paragraph examples:
- Open recent reports and inspect records from desktop.
- Review report status, failures, and corrections from a calm desktop surface.

Reports list description examples:
- Review recent reports and open one to inspect records.
- Recent reports are listed here for desktop review.

Blocked state examples:
- Live report access requires venue and user context.
- Review submission requires user context.

Not found examples:
- This report could not be found.
- Return to reports and choose another report.

Record block labels:
- Original model output
- Final corrected values
- Failed record
- Error code
- Error message
- Fill level
- Bottle match

Do not drift into:
- luxury copywriting
- ops-consulting copywriting
- startup copywriting


==================================================
33. BANNED STRINGS FROM PRIOR ATTEMPTS
==================================================

These literal or near-literal strings should not appear in the output:

- Inventory Report
- Inventory Reports
- Main Bar Audit
- End of Shift Reconciliation
- Zone B Audit
- Zone 1
- Variance Target
- Expected Value
- Auditor
- Total Items
- Successful
- Failed Records as a summary KPI block
- System Activity Log
- Review Context Settings
- System Diagnostics
- Resolve All
- Manual Entry
- Adjust Inventory
- Verified Brand
- Tactical Insight
- Operational Systems
- Status
- Documentation
- Support

If you find yourself wanting to use one of these strings, you are probably inventing unsupported scope.


==================================================
34. DO NOT OUTPUT A DESIGN ESSAY
==================================================

Do not produce a design manifesto.
Do not produce a philosophy essay.
Do not produce a branded design system concept like:
- Operator’s Edition
- Night Steward
- Copper Ledger

Do not rename the design language.
Do not narrate your own aesthetic theory.
Just produce the screens.

The deliverable should be closer to product mockups than to a creative writing exercise.


==================================================
35. EMPTY, BLOCKED, AND QUIET-STATE DISCIPLINE
==================================================

The weakest prior attempts failed when they reached a screen with less data.
Instead of staying calm and sparse, they started inventing systems language, admin chrome, diagnostics, and filler modules.
Do not do that.

When a screen has less to show, the design should become:
- calmer
- simpler
- more spacious
- more direct

It should not become:
- more enterprise
- more technical
- more managerial
- more explanatory
- more decorative

For every low-information screen, follow these rules:

Reports list empty state:
- one page heading
- one short explanation
- one subdued empty-state panel or message area
- optional single route-safe action like returning to the main reports surface

Blocked / unavailable state:
- one clear heading
- one short sentence that live access requires venue and user context
- one quiet explanatory note if needed
- no diagnostics block
- no checklist
- no system health copy
- no environment copy
- no onboarding wizard

Not found state:
- one clear heading
- one short sentence
- one route-safe recovery action
- no illustrative fake data
- no suggested reports grid
- no “recently viewed”

Processing state:
- a real report shell with a clearly processing status
- progress emphasis where progress is actually known
- record list may be partially populated if that is consistent with backend truth
- no invented “AI working” theater
- no fake processing pipeline diagram

Created state:
- a real report shell
- minimal metadata
- status emphasis
- calm explanation that processing has not advanced
- no assumptions about why

Failure emphasis state:
- keep the same report page structure
- increase error clarity inside the report content area
- do not pivot into an incident console
- do not add remediation dashboards
- do not add escalation pathways

If a screen is mostly empty, resist the temptation to decorate it with:
- key metrics
- helper side modules
- tips and tricks
- best practices
- educational explainer boxes
- audit summaries
- activity feeds
- notifications
- contextual insights

Sparse screens are acceptable.
Blankness is better than false product claims.


==================================================
36. FORBIDDEN CHROME, UTILITY, AND ENTERPRISE DRIFT
==================================================

Previous attempts showed a strong tendency to turn this product into a faux-enterprise web app.
This section exists to stop that drift completely.

Forbidden global chrome:
- left navigation sidebar
- right utility rail
- footer nav
- footer legal links
- footer support links
- top-right notification bell
- top-right avatar menu
- workspace switcher
- organization switcher
- environment selector
- command palette launcher
- global search box
- breadcrumb stacks longer than a simple page context hint

Forbidden utility destinations:
- Status
- Documentation
- Support
- Help Center
- Release Notes
- Admin
- Preferences
- Team Activity
- Audit Center
- Review Queue
- Insights
- Analytics

Forbidden global actions:
- Export
- Download
- Share
- Resolve All
- Bulk approve
- Bulk reject
- Adjust inventory
- Manual entry
- Sync now
- Retry all
- Reprocess

Forbidden decorative or managerial modules:
- KPI tiles
- trend charts
- sparkline cards
- region maps
- productivity summaries
- workload summaries
- team performance callouts
- exception dashboards
- operational excellence modules
- utilization widgets
- system notices
- release banners
- upgrade prompts

Forbidden fake enterprise writing styles:
- “command center”
- “operational visibility”
- “cross-functional oversight”
- “compliance posture”
- “fleet-wide performance”
- “exception management”
- “workflow orchestration”
- “continuous monitoring”

The UI must read like a specific, narrow review surface.
It must not read like software purchased by a VP of Operations.

If you feel the urge to “round out” the product with more navigation, more account chrome, more utilities, or more executive language, stop.
That urge is exactly the failure mode.

This project wins by being narrow, disciplined, and almost a little stubborn.
It should give the impression that the team knew exactly what they were willing to ship and declined to fake the rest.


==================================================
37. FINAL VALIDATION CHECKLIST
==================================================

Before finalizing the design, validate all of the following:

1. Does every visible thing map directly to the backend truth described above?
2. Are all statuses named exactly as the backend names them?
3. Is BARTOOLS mobile clearly the visual parent?
4. Is Manrope used for body copy rather than Inter?
5. Are there zero sidebars, zero footer utility links, and zero profile/notification controls?
6. Are there zero synthetic metrics?
7. Are there zero invented report titles?
8. Are there zero fake actions like Export, Resolve All, Manual Entry, or Adjust Inventory?
9. Are the review controls limited to bottle selection and fill level selection?
10. Does the product feel like a quiet review desk rather than a control center?

If any answer is no, revise the design before finalizing.

If there is any conflict between:
- richer
and
- truer

choose truer.
```
