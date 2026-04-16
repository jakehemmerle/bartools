# Stitch Prompt V4: BARBACK Web Reports Workbench

Use the following prompt in a fresh Stitch project.

```text
Design a desktop web reports workbench for BARBACK.

This is a fresh project.
Do not inherit assumptions from prior Stitch attempts.
Do not reuse prior Stitch information architecture.
Do not reuse prior Stitch page naming.
Do not reuse prior Stitch utility chrome.
Do not reuse prior Stitch metrics.
Do not reuse prior Stitch action vocabulary.
Do not reuse prior Stitch “luxury dashboard” instincts.

The design must defer to:
- the BARBACK mobile app for design
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
- a BARBACK companion interface

The product job is extremely narrow:
- open reports
- inspect report state
- inspect report records
- compare original model output against corrected final values
- understand failures
- prepare review decisions

The web surface must not imply broader authority than the backend actually exposes.
The web surface must not create any new product obligations for mobile or backend.
The web surface must feel subordinate to the existing BARBACK product family, not like a new platform.


==================================================
1. SOURCE OF TRUTH HIERARCHY
==================================================

There are exactly two sources of truth.

Design source of truth:
- BARBACK mobile app
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
All detail-related states must share the same shell and page family.

That means:
- same top shell
- same page frame
- same overall detail-page family
- same report-header structure where a report is actually present
- same record-list structure where records are actually present
- same record-card family where records are actually present
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

Important clarification:
- blocked and not-found states should reuse the shell and page family
- blocked and not-found states do not need fake record cards
- blocked and not-found states do not need a populated detail header
- blocked and not-found states should be visibly simpler than a populated report detail page


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

The web surface must feel like BARBACK mobile translated to desktop.

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
- controlled green for reviewed
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
- BARBACK wordmark or simple brand mark
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
- BARBACK identity
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
- historical and calm tone

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
- one clear desktop adaptation of BARBACK mobile

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
- calmer
- resolved-looking without ceremony
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
- footer Status link
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
37. REPORTS LIST SCREEN: LITERAL CONTENT CONTRACT
==================================================

This section exists because previous attempts kept turning the reports list into a managerial dashboard.
The reports list is not a dashboard.
The reports list is not an inbox.
The reports list is not a review queue management surface.
The reports list is not an analytics table.

The reports list is a single screen showing rows shaped by the backend `ReportListItem` contract.

The reports list may visually emphasize:
- scanability
- status
- recency
- bottle count
- calm desktop readability

The reports list may not visually imply:
- workflow ownership
- org hierarchy
- bulk operations
- operator performance
- system orchestration
- governance
- compliance

Allowed row data:
- report id
- started at
- completed at
- user display name if present
- bottle count
- status

Allowed row labels:
- Report ID
- Status
- Operator
- Started
- Completed
- Bottle Count

Disallowed row labels:
- Queue
- Priority
- Severity
- Station
- Venue
- Location
- Reviewer
- Assignee
- Batch
- Stream
- Archive
- Intake
- Outcome
- Health
- Diagnostic

Allowed reports list actions:
- open report
- back to entry surface if you expose that path

Disallowed reports list actions:
- Review All
- Export All
- Retry All
- Bulk Submit
- Queue Review
- Resolve
- Investigate
- Assign
- Escalate
- Share
- Archive

Allowed row values for status:
- created
- processing
- unreviewed
- reviewed

Do not title-case these if the design works better with lowercase.
Do not rename them.
Do not embellish them.
Do not add helper suffixes.

Forbidden status variants:
- queued
- running
- complete
- completed
- verified
- settled
- finalized
- archived
- successful
- needs review
- failed review

Allowed visual emphasis for an unreviewed row:
- slightly warmer tint
- slightly stronger surface contrast
- slightly stronger text contrast

Disallowed visual emphasis for an unreviewed row:
- danger-strip styling
- blinking urgency
- inbox badge language
- exclamation icon overload
- giant warning banner

Allowed visual emphasis for a processing row:
- subtle animated or implied motion
- progress-adjacent rhythm if progress is real
- lower contrast than unreviewed

Disallowed visual emphasis for a processing row:
- fake percent complete
- fake pipeline stage list
- AI theater copy
- giant loading halos
- technical diagnostics

Allowed visual emphasis for a reviewed row:
- calmer state chip
- more resolved surface treatment
- lower urgency

Disallowed visual emphasis for a reviewed row:
- seals
- archive stamps
- immutable record framing
- “signed off”
- “sealed”
- “finalized ledger”

Allowed report ids:
- realistic report ids
- uuid-like ids if you want
- concise backend-feeling ids if they are still clearly report ids

Disallowed report ids:
- invoice ids
- transaction ids
- archive ids
- item ids masquerading as report ids

Allowed operator cells:
- a person name
- a machine-like placeholder only if clearly user-display-name-like
- an empty placeholder if the data is absent

Disallowed operator cells:
- job titles
- departments
- supervisor names
- signatures
- employee IDs
- initials plus rank

Allowed empty completed value for `created` or `processing`:
- em dash
- subdued placeholder
- blank-safe value

Disallowed empty completed value:
- ETA
- pending review by
- waiting on system
- “in queue”

Allowed bottle count value:
- integer
- comma-formatted integer

Disallowed bottle count value:
- cases
- SKUs
- records reviewed
- exceptions found

If you want the reports list to feel more alive, do it through:
- typography
- spacing
- tonal contrast
- hover rhythm
- chip treatment

Do not do it through:
- extra columns
- management metadata
- fake explanation text per row
- mini charts
- row-level menus

The list page heading should stay plain.
Preferred headings:
- Reports
- Recent Reports

Disallowed headings:
- Operations Center
- Review Queue
- Daily Reporting Hub
- Ledger
- Audit Desk
- Archive

The supporting sentence under the heading should stay plain.
Allowed examples:
- Review recent reports and open one to inspect records.
- Open a report to inspect records and status.

Disallowed supporting copy:
- language about throughput
- language about command
- language about exception management
- language about operational intelligence


==================================================
38. ENTRY SURFACE: LITERAL CONTENT CONTRACT
==================================================

The entry surface is not a landing page in the SaaS sense.
It is not a sales surface.
It is not an onboarding surface.
It is not an auth surface.

The entry surface is a small wayfinding surface.
It exists to frame the workbench.
It exists to open reports.
It exists to calmly state the integration limitation.

Allowed entry surface elements:
- BARBACK wordmark
- heading
- one short explanatory sentence
- one primary action to open reports
- one quiet note about venue and user context

Disallowed entry surface elements:
- testimonials
- feature grid
- pricing
- trust bar
- CTA pair
- sign in
- start free
- create account
- learn more
- product marketing copy
- footer links
- nav clusters

Allowed heading ideas:
- Reports Workbench
- Review Reports
- Desktop Reports

Disallowed heading ideas:
- Control Center
- Operations Hub
- Inventory Command
- Review Console
- BARBACK Reserve
- Ledger Workbench

Allowed body copy tone:
- calm
- direct
- short
- low-ego

Disallowed body copy tone:
- luxurious
- self-congratulatory
- consultative
- marketing heavy
- heroic

Allowed primary action label:
- Open Reports

Disallowed primary action labels:
- Launch Workbench
- Enter Control Room
- Review All
- Start Session
- Open Dashboard

Allowed quiet note:
- Live access requires venue and user context.

Disallowed quiet note:
- environment details
- auth bootstrap details
- developer wording
- system error wording

Visually, the entry surface may be:
- sparse
- centered
- quiet
- dark
- typographic

Visually, the entry surface may not be:
- feature-rich
- card-heavy
- side-nav-based
- modal-heavy
- dashboard-like


==================================================
39. CREATED SCREEN: LITERAL CONTENT CONTRACT
==================================================

The `created` report state should still feel like a report detail page.
It should not collapse into a generic empty state.
It should not pretend processing has begun if that is not established.

Allowed top-level header data:
- report id
- status = created
- started at if present
- completed at if absent show empty-safe treatment
- operator name if present

Allowed supporting message:
- processing has not advanced yet
- report exists but results are not ready

Disallowed supporting message:
- queue internals
- model internals
- retries
- escalation
- failure diagnosis
- promises about timing

Allowed created-state body:
- one calm status explanation block
- optional shell for future record list area that is empty
- optional subdued placeholder indicating records are not available yet

Disallowed created-state body:
- fake progress bar
- fake photo tiles
- fake pending records
- fake SSE stages
- fake pipeline cards

Allowed actions:
- back to reports

Disallowed actions:
- refresh status
- retry
- submit review
- review all
- investigate

The created screen should visually say:
- this report exists
- it is early
- there is nothing to do yet

The created screen should not visually say:
- the system is broken
- the user needs to intervene
- a queue manager should operate something


==================================================
40. PROCESSING SCREEN: LITERAL CONTENT CONTRACT
==================================================

The `processing` report state is where Stitch is most tempted to invent fake AI theater.
Do not let it.

Allowed top-level header data:
- report id
- status = processing
- started at if present
- completed at if absent show empty-safe treatment
- operator name if present

Allowed body data:
- report progress if real
- partially available bottle records if real
- thumbnails
- record rows with pending or inferred status if appropriate

Allowed body labels:
- Processing
- In progress
- Records
- Bottle Count only if truly coming from report context

Disallowed body labels:
- pipeline
- model phase
- AI stream state
- confidence graph
- inference engine
- system jobs
- worker status

Allowed processing-state cues:
- mild motion
- subdued loading tone
- partial record appearance
- calm transitional state

Disallowed processing-state cues:
- fake percentages
- glowing neural graphics
- stage steppers
- “thinking”
- “analyzing image embeddings”
- “validating taxonomy”

If records are shown during processing:
- they should still look like bottle report records
- they should still use bottle imagery
- they should still use backend statuses

If records are not shown during processing:
- keep the page sparse
- do not compensate with invented infrastructure

Allowed actions:
- back to reports

Disallowed actions:
- review all
- force complete
- restart processing
- retry validation
- export partial


==================================================
41. UNREVIEWED SCREEN: LITERAL CONTENT CONTRACT
==================================================

The `unreviewed` screen is the most important screen.
It is where Stitch must be most disciplined.

The `unreviewed` screen must remain a bottle-report review page.
It must not become an audit page.
It must not become a shift report.
It must not become a station anomaly report.
It must not become a generic moderation console.

Allowed top-level header data:
- report id
- status = unreviewed
- started at if present
- completed at if present
- operator name if present

Disallowed top-level header data:
- station
- zone
- venue if not part of actual screen contract
- anomaly count
- review SLA
- reviewer assignment
- signature
- archive reference

Allowed page title:
- report id
- or a simple heading that is still clearly report-derived

Preferred safe choice:
- show the report id as the main title

Disallowed page title:
- Main Bar Audit
- End of Shift Review
- Daily Inventory Review
- Nightly Audit
- Zone Review

Allowed record content:
- bottle image
- bottle name
- category if present
- upc if present
- volume ml if present
- fill percent
- record status
- corrected indicator if present
- original model output if present
- corrected values if present
- review controls
- error code if failed
- error message if failed

Disallowed record content:
- station
- confidence
- anomaly explanation
- historical averages
- expected fill
- variance target
- reviewer note
- location heat
- shelf risk

Allowed record statuses on this page:
- pending
- inferred
- failed
- reviewed

Disallowed record statuses on this page:
- verified
- corrected and settled
- flagged
- approved
- resolved

Allowed review controls:
- bottle selection
- fill tenth selection

Allowed bottle selection control treatments:
- search/select
- dropdown
- combobox style

Allowed fill control treatments:
- segmented tenth choices
- slider if you absolutely must

Preferred fill control treatment:
- discrete tenth choices from 0 through 10

Allowed fill labels:
- 0
- 1
- 2
- 3
- 4
- 5
- 6
- 7
- 8
- 9
- 10

Allowed fill labels if you insist on decimals:
- 0.0
- 0.1
- 0.2
- 0.3
- 0.4
- 0.5
- 0.6
- 0.7
- 0.8
- 0.9
- 1.0

Disallowed fill labels:
- Empty
- Quarter
- Half
- Nearly full
- Full

Allowed submit action:
- Submit Review

Disallowed submit action:
- Review All
- Approve
- Finalize
- Resolve
- Confirm Inventory
- Save Ledger

Allowed page framing copy:
- direct
- narrow
- factual

Disallowed page framing copy:
- anomaly narrative
- station operations narrative
- historical deviation story
- audit language

If you need a small explanatory sentence:
- tie it to the record itself
- keep it subordinate
- keep it factual

If the page already has the necessary controls:
- do not add helper banners
- do not add tooltips explaining the business
- do not add secondary cards


==================================================
42. REVIEWED SCREEN: LITERAL CONTENT CONTRACT
==================================================

The `reviewed` screen is where previous attempts became the most absurd.
The `reviewed` screen is still a report.
It is not an archive artifact.
It is not a compliance record.
It is not a sealed ledger.
It is not a museum placard.

Allowed top-level header data:
- report id
- status = reviewed
- started at if present
- completed at if present
- operator name if present

Allowed overall page purpose:
- show reviewed report
- show final corrected values
- show which records were corrected
- show calm post-review state

Disallowed overall page purpose:
- archive
- settlement
- compliance sign-off
- immutable vault record
- official certificate

Allowed reviewed-state copy:
- Reviewed
- Final corrected values
- Original model output
- Corrected values

Disallowed reviewed-state copy:
- reviewed and settled
- archived
- sealed
- immutable
- signed
- final ledger entry
- clearance
- archive ref

Allowed record presentation:
- a record card
- original model output block
- corrected values block
- unchanged values shown quietly

Disallowed record presentation:
- industrial substrate
- settled records
- intake variance
- environmental conditions
- reviewer notes
- audit logs
- correction source
- storage location
- clearance stamp

Allowed reviewed-state color treatment:
- calmer
- less urgent
- slightly more resolved

Disallowed reviewed-state color treatment:
- green victory screen
- certificate styling
- seal or badge iconography

Allowed reviewed-state action surface:
- back to reports

Disallowed reviewed-state action surface:
- review all
- archive
- share
- export
- audit log
- view logs

Preferred main title on reviewed screen:
- report id

Alternative acceptable main title:
- a plain title that still contains the report id prominently

Disallowed main title:
- Daily Operations Summary
- End of Record
- Archive Summary
- Settled Batch

If you want to show a “corrected” distinction:
- show it inline at record level
- show the original and corrected values side by side or stacked
- keep it concrete

Do not show:
- institutional gravitas
- bureaucratic jargon
- governance theater


==================================================
43. FAILED EMPHASIS SCREEN: LITERAL CONTENT CONTRACT
==================================================

The failed-emphasis screen is not a separate product.
It is still a report detail page.
It is a report detail page where failed records are visually clearer.

Allowed page-level meaning:
- this report contains failed records
- failures need visibility during review

Disallowed page-level meaning:
- incident management
- systems troubleshooting
- upstream integration center
- operator escalations

Allowed top-level header data:
- report id
- status = unreviewed if that is the report status
- failed record emphasis in the body

Disallowed top-level header data:
- failure present as a new report status
- status suffixes like `(failures present)`
- technical health labels

Allowed failed record content:
- bottle image if available
- bottle name if available
- record status = failed
- error code
- error message
- original model output if present
- review controls if appropriate

Disallowed failed record content:
- account
- amount
- transaction id
- vendor taxonomy
- provider retry hints
- upstream system references
- network diagnostic details

Allowed failed record actions:
- back to reports
- continue review if the page still supports it

Disallowed failed record actions:
- Investigate
- Retry Validation
- Escalate
- Open Incident
- Reprocess

Allowed failed-state copy:
- Failed record
- Error code
- Error message
- Review required

Disallowed failed-state copy:
- anomalous batch
- validation call
- upstream provider
- exception workflow
- incident

Visually, failed emphasis may use:
- error tint
- stronger contrast
- clearer error block

Visually, failed emphasis may not use:
- red control-room design
- alarm panel treatment
- incident dashboard conventions


==================================================
44. COMPARISON EMPHASIS SCREEN: LITERAL CONTENT CONTRACT
==================================================

The comparison-emphasis screen exists to show original model output versus corrected final values for bottle records.
It is not a document extraction demo.
It is not a form OCR demo.
It is not a finance workflow.
It is not a procurement workflow.

Allowed page-level idea:
- this report contains records where original and corrected values are important to compare

Allowed comparison labels:
- Original model output
- Final corrected values
- Corrected values

Allowed comparison fields:
- bottle name
- category
- upc
- volume ml
- fill percent

Allowed comparison field behavior:
- show original if present
- show corrected if present
- show unchanged fields quietly

Disallowed comparison fields:
- vendor name
- line items
- tax forms
- payer TIN
- invoice amount
- invoice parsing batch
- document extract ids

Allowed comparison visuals:
- split panels
- stacked panels
- inline diff rhythm

Disallowed comparison visuals:
- document icons implying scanned paperwork
- office workflow semantics
- financial review semantics

Preferred comparison-page title:
- report id

Disallowed comparison-page title:
- Workbench
- Invoice Extract
- Tax Form Extract


==================================================
45. BLOCKED / UNAVAILABLE SCREEN: LITERAL CONTENT CONTRACT
==================================================

The blocked screen is one of the few places where sparse design is the correct answer.
It should be short.
It should be quiet.
It should not become a systems page.

Allowed blocked-state heading:
- Access Unavailable

Allowed blocked-state body:
- Live report access requires venue and user context.
- Review submission requires user context.

Allowed blocked-state actions:
- Back to Reports

Allowed blocked-state disabled action if you really want one:
- a disabled Submit button

Disallowed blocked-state actions:
- Sign in
- Connect venue
- Complete setup
- Open settings
- Retry auth
- Contact support

Disallowed blocked-state copy:
- diagnostics
- environment names
- auth stack details
- role debugging
- developer caveats

Disallowed blocked-state modules:
- help center card
- system status card
- context settings card
- review context panel

Visually, blocked state may use:
- centered composition
- icon
- dimmed action
- quiet return link

Visually, blocked state may not use:
- giant troubleshooting flow
- side content
- educational modules


==================================================
46. NOT FOUND SCREEN: LITERAL CONTENT CONTRACT
==================================================

The not-found screen should be even simpler than the blocked screen.

Allowed not-found heading:
- Report Not Found

Allowed not-found body:
- This report could not be found.
- Return to reports and choose another report.

Allowed not-found action:
- Back to Reports

Disallowed not-found action:
- search docs
- contact support
- regenerate report
- submit ticket

Disallowed not-found copy:
- deleted if you do not know that
- permission explanations
- ID format guidance
- stack traces

Visually:
- one calm message block
- one recovery action
- no fake nearby reports
- no recent history


==================================================
47. EXACT FIELD INVENTORY FROM SHARED TYPES
==================================================

This section should be treated as a whitelist.
If a field is not here, do not invent it.

`ReportListItem` fields available to design:
- id
- startedAt
- completedAt
- userId
- userDisplayName
- bottleCount
- status

`ReportDetail` fields available to design:
- id
- startedAt
- completedAt
- userId
- userDisplayName
- status
- bottleRecords

`ReportBottleRecord` fields available to design:
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

`ModelOutput` fields available to design:
- bottleName
- category
- upc
- volumeMl
- fillPercent

What this means in practice:
- do not invent a station field
- do not invent a confidence field
- do not invent reviewer notes
- do not invent archive ids
- do not invent signatures
- do not invent environmental metadata

If you want metadata richness:
- use typography
- use layout
- use image treatment

Do not use:
- fictional data shapes


==================================================
48. EXACT STATUS AND EVENT LEXICON
==================================================

Use the backend/shared vocabulary exactly.

Allowed report statuses:
- created
- processing
- unreviewed
- reviewed

Allowed record statuses:
- pending
- inferred
- failed
- reviewed

Allowed stream event concepts if visually implied:
- report.progress
- record.inferred
- record.failed
- record.reviewed
- report.ready_for_review

Disallowed report statuses:
- queued
- ready
- successful
- verified
- settled
- archived
- closed
- complete

Disallowed record statuses:
- corrected
- approved
- resolved
- matched
- verified
- needs attention

If you need a “corrected” notion:
- use it as a property of values
- do not turn it into a replacement status

If a report contains failed records:
- the report status is still one of the allowed report statuses
- do not invent a failure report status


==================================================
49. EXACT ACTION LEXICON
==================================================

Allowed global actions:
- Open Reports
- Back to Reports

Allowed report-level actions:
- Submit Review
- Back to Reports

Allowed record-level interactions:
- choose bottle
- choose fill level

Disallowed global actions:
- Review All
- Retry
- Retry Validation
- Investigate
- Resolve All
- Export
- Share
- Archive
- Reprocess
- Adjust Inventory
- Manual Entry

Disallowed report-level actions:
- Finalize Ledger
- Seal Record
- Sign Off
- Approve Batch
- Submit Exception Review

Disallowed record-level actions:
- open logs
- view diagnostics
- escalate
- retry inference
- assign reviewer


==================================================
50. NARROW NOUN DICTIONARY
==================================================

Preferred nouns:
- report
- record
- bottle
- review
- operator
- reports
- report detail
- original model output
- corrected values
- fill level
- bottle count
- venue
- location

Disallowed nouns:
- ledger
- archive
- audit
- station
- zone
- command center
- operations summary
- incident
- queue manager
- validation provider
- substrate
- item reference
- intake variance
- clearance
- signature
- archive ref
- diagnostics

Disallowed finance nouns:
- invoice
- tax form
- amount
- payer
- vendor
- line item
- transaction
- account

Disallowed industrial nouns:
- substrate
- processing parameters
- storage loc
- environmental
- hazard


==================================================
51. SCREEN-BY-SCREEN FORBIDDEN COPY EXAMPLES
==================================================

If you are about to write any of the following, stop.

Forbidden on entry screen:
- BARBACK Reserve
- Review Control Center
- Daily Operations Hub

Forbidden on reports list:
- Back to Ledger
- Review All
- Daily Reporting Queue
- Review Desk Archive

Forbidden on created screen:
- Refresh Status
- Queue Position
- Processing SLA

Forbidden on processing screen:
- Inference Pipeline
- Validation Stage
- AI Processing Graph

Forbidden on unreviewed screen:
- Main Bar Audit
- Historical averages
- anomaly in fill level reading
- station
- confidence

Forbidden on reviewed screen:
- Daily Operations Summary
- Reviewed & Settled
- Record is sealed and immutable
- Operator Signature
- Clearance
- Settled Records
- End of Record

Forbidden on failed-emphasis screen:
- anomalous records
- upstream provider
- Retry recommended
- Investigate
- Retry Validation

Forbidden on comparison-emphasis screen:
- Invoice Extract
- Tax Form
- Vendor Name
- Payer TIN

Forbidden on blocked screen:
- Review Context Settings
- System Diagnostics
- Complete Setup

Forbidden on not-found screen:
- Contact Support
- Open Docs
- Search System


==================================================
52. OUTPUT REQUIREMENT: DO NOT WANDER
==================================================

Your deliverable should include only the requested screens.
Do not add extra screens.
Do not add extra modals.
Do not add extra drawers.
Do not add extra navigation destinations.

If you need to express nuance:
- do it inside the requested screens

Do not express nuance by inventing:
- settings
- admin
- profile
- notifications
- docs
- status page
- support

Each screen should be legible enough that a frontend engineer could infer:
- hierarchy
- spacing
- states
- components
- typography
- action emphasis

Each screen should not require the frontend engineer to infer:
- product scope
- backend nouns
- hidden system behavior
- invented data fields

If a screen feels too simple:
- that is acceptable

If you think “this needs one more module so it feels complete”:
- do not add the module

If you think “this needs a richer title so it feels premium”:
- do not write the richer title

If you think “this needs a side action to feel like real software”:
- do not add the side action

The desktop workbench is allowed to feel:
- narrow
- disciplined
- slightly severe
- quiet

The desktop workbench is not allowed to feel:
- under-specified by adding lies


==================================================
53. PER-SCREEN HEADER WHITELIST
==================================================

This section exists because Stitch keeps hallucinating titles and metadata clusters.
Use this as a screen-by-screen whitelist.

Entry surface header may include:
- BARBACK wordmark
- Reports Workbench heading

Entry surface header may not include:
- account nav
- user name
- profile icon
- bell icon
- workspace title

Reports list header may include:
- BARBACK wordmark
- simple back path only if it makes sense
- Reports heading
- one short supporting sentence

Reports list header may not include:
- Review All
- queue count
- unresolved count
- profile avatar
- utility links

Created screen header may include:
- BARBACK wordmark
- Back to Reports
- report id
- created status chip
- started at if present
- completed at empty-safe placeholder
- operator if present

Created screen header may not include:
- refresh action
- queue metadata
- retry action
- diagnostics

Processing screen header may include:
- BARBACK wordmark
- Back to Reports
- report id
- processing status chip
- started at if present
- completed at empty-safe placeholder
- operator if present

Processing screen header may not include:
- pipeline title
- stage title
- model version marketing
- AI icon cluster

Unreviewed screen header may include:
- BARBACK wordmark
- Back to Reports
- report id
- unreviewed status chip
- started at if present
- completed at if present
- operator if present

Unreviewed screen header may not include:
- Main Bar Audit
- station
- anomaly count
- confidence summary
- Review All

Reviewed screen header may include:
- BARBACK wordmark
- Back to Reports
- report id
- reviewed status chip
- started at if present
- completed at if present
- operator if present

Reviewed screen header may not include:
- Daily Operations Summary
- archive reference
- operator signature
- clearance
- profile icon

Failed-emphasis screen header may include:
- BARBACK wordmark
- Back to Reports
- report id
- unreviewed status chip
- one short subtitle if needed

Failed-emphasis screen header may not include:
- status suffix with invented failure phrase
- incident label
- diagnostic strip
- retry action

Comparison-emphasis screen header may include:
- BARBACK wordmark
- Back to Reports
- report id
- reviewed status chip

Comparison-emphasis screen header may not include:
- invoice title
- form title
- batch parsing label
- document workflow copy

Blocked screen header may include:
- BARBACK wordmark
- Back to Reports if shown
- Access Unavailable

Blocked screen header may not include:
- setup wizard title
- system context title
- auth failure title

Not-found screen header may include:
- BARBACK wordmark
- Back to Reports if shown
- Report Not Found

Not-found screen header may not include:
- troubleshooting title
- system lookup title
- recovery center title


==================================================
54. PER-SCREEN ACTION WHITELIST
==================================================

This section exists because Stitch keeps sprinkling actions into dead corners of the UI.
Do not improvise actions.

Entry surface allowed actions:
- Open Reports

Entry surface disallowed actions:
- Sign in
- Start free
- Create account
- Learn more
- Contact sales

Reports list allowed actions:
- open a row
- Back to entry surface only if present as minimal pathing

Reports list disallowed actions:
- Review All
- Bulk review
- Export all
- Sort by severity
- Open filters drawer

Created screen allowed actions:
- Back to Reports

Created screen disallowed actions:
- Refresh Status
- Retry
- Submit Review
- View Diagnostics

Processing screen allowed actions:
- Back to Reports

Processing screen disallowed actions:
- Review All
- Stop Processing
- Retry Validation
- Reprocess
- Export partial

Unreviewed screen allowed actions:
- Back to Reports
- Submit Review
- choose bottle
- choose fill level

Unreviewed screen disallowed actions:
- Review All
- bulk apply
- anomaly explain
- adjust inventory
- manual entry mode
- export

Reviewed screen allowed actions:
- Back to Reports

Reviewed screen disallowed actions:
- Archive
- View Logs
- Share
- Export
- Review All
- Open Profile

Failed-emphasis screen allowed actions:
- Back to Reports
- record-level correction controls if still part of review
- Submit Review if the page is still an unreviewed screen variant

Failed-emphasis screen disallowed actions:
- Investigate
- Retry Validation
- Escalate
- Open Incident
- Contact support

Comparison-emphasis screen allowed actions:
- Back to Reports

Comparison-emphasis screen disallowed actions:
- Open Source Document
- Compare All
- Export Diff
- Audit Trail

Blocked screen allowed actions:
- Back to Reports
- optional disabled Submit

Blocked screen disallowed actions:
- Connect Venue
- Retry Auth
- Open Settings
- Contact Admin

Not-found screen allowed actions:
- Back to Reports

Not-found screen disallowed actions:
- Search
- Open Docs
- Contact Support
- Restore Report


==================================================
55. PER-SCREEN DENSITY AND LAYOUT RULES
==================================================

This section exists because Stitch keeps solving uncertainty by adding more furniture.

Entry surface density:
- sparse
- centered
- large breathing room
- one focal action

Entry surface layout should not include:
- sidebars
- secondary columns
- feature cards
- footer grids

Reports list density:
- medium
- table-led
- strong scanability
- restrained chrome

Reports list layout should not include:
- right rail
- left rail
- metric band above table
- stacked summary cards

Created screen density:
- light
- a little emptier than list
- enough structure to feel like a real report

Created screen layout should not include:
- fake records
- fake progress modules
- empty helper panels

Processing screen density:
- medium-light
- transitional
- able to show partial records if useful

Processing screen layout should not include:
- stage diagrams
- queue maps
- system cards
- processing metrics unrelated to backend truth

Unreviewed screen density:
- medium
- concentrated around records and controls
- record-first

Unreviewed screen layout should include:
- strong report header
- clear record stack
- obvious submit review action at the page end or top-right if extremely restrained

Unreviewed screen layout should not include:
- extra utility rail
- multi-panel dashboard shell
- separate anomalies panel
- recommendations panel

Reviewed screen density:
- medium
- calmer than unreviewed
- still record-first

Reviewed screen layout should include:
- clear reviewed state
- readable original-versus-corrected presentation when applicable

Reviewed screen layout should not include:
- commemorative empty space
- archive plaque
- sign-off block
- certification ornament

Failed-emphasis screen density:
- medium
- more contrast around failed records
- same overall page family as report detail

Failed-emphasis screen layout should not include:
- incident board composition
- side diagnosis module
- remediation footer

Comparison-emphasis screen density:
- medium
- generous enough for side-by-side reading
- still obviously a bottle report screen

Comparison-emphasis screen layout should not include:
- document-office composition
- scanned-paper theater
- admin audit composition

Blocked screen density:
- sparse
- centered
- one message block

Blocked screen layout should not include:
- reasons list
- technical checklist
- side explanation cards

Not-found screen density:
- sparse
- one message block
- one recovery action

Not-found screen layout should not include:
- nearby suggestions
- history trails
- search modules


==================================================
56. MICROCOPY SHAPE RULES
==================================================

These rules govern sentence length and copy texture.

Headings should usually be:
- 1 to 4 words

Supporting body copy should usually be:
- 1 sentence
- under 18 words if possible

Button copy should usually be:
- 1 to 2 words

Status labels should usually be:
- exactly the backend status

Field labels should usually be:
- literal
- descriptive
- noun-based

Do not write:
- paragraphs that explain the business
- poetic metaphors
- noir bartender prose
- technical implementation narration

Do write:
- short operational copy
- obvious field labels
- direct recovery language

If a sentence contains:
- “operational”
- “exception”
- “archive”
- “variance”
- “context settings”

you should assume the sentence is probably wrong unless it is directly required by backend truth.


==================================================
57. CANONICAL SAMPLE DATA PACK
==================================================

Use the following sample data shapes as the default mental model.
You do not need to show every field on every screen.
You do need to stay inside this domain.

Canonical `ReportListItem` examples:

```json
[
  {
    "id": "8b3c6b41-2856-429a-b8fc-7c6530b138e6",
    "startedAt": "2026-04-15T09:00:12Z",
    "completedAt": "2026-04-15T09:45:00Z",
    "userId": "usr_01",
    "userDisplayName": "Elena Rostova",
    "bottleCount": 84,
    "status": "reviewed"
  },
  {
    "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "startedAt": "2026-04-15T12:15:44Z",
    "completedAt": "2026-04-15T12:18:12Z",
    "userId": "usr_02",
    "userDisplayName": "Alex Thorne",
    "bottleCount": 42,
    "status": "unreviewed"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "startedAt": "2026-04-15T14:32:01Z",
    "completedAt": null,
    "userId": "usr_03",
    "userDisplayName": "Jordan Lee",
    "bottleCount": 19,
    "status": "processing"
  },
  {
    "id": "1a2b3c4d-5e6f-7081-9201-1k2l3m4n5o6p",
    "startedAt": "2026-04-15T08:15:00Z",
    "completedAt": null,
    "userId": "usr_04",
    "userDisplayName": "Morgan Silva",
    "bottleCount": 0,
    "status": "created"
  }
]
```

Canonical `ReportDetail` example:

```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "startedAt": "2026-04-15T12:15:44Z",
  "completedAt": "2026-04-15T12:18:12Z",
  "userId": "usr_02",
  "userDisplayName": "Alex Thorne",
  "status": "unreviewed",
  "bottleRecords": []
}
```

Canonical `ReportBottleRecord` examples:

Inferred record:

```json
{
  "id": "rec_001",
  "imageUrl": "https://example.com/reports/rec_001.jpg",
  "bottleName": "Maker's Mark Kentucky Straight Bourbon",
  "category": "bourbon",
  "upc": "085246000467",
  "volumeMl": 750,
  "fillPercent": 40,
  "corrected": false,
  "status": "inferred",
  "originalModelOutput": {
    "bottleName": "Maker's Mark Kentucky Straight Bourbon",
    "category": "bourbon",
    "upc": "085246000467",
    "volumeMl": 750,
    "fillPercent": 40
  }
}
```

Failed record:

```json
{
  "id": "rec_002",
  "imageUrl": "https://example.com/reports/rec_002.jpg",
  "bottleName": "Unknown bottle",
  "fillPercent": 0,
  "corrected": false,
  "status": "failed",
  "errorCode": "BOTTLE_MATCH_FAILED",
  "errorMessage": "Bottle match could not be determined from the captured image."
}
```

Reviewed record with corrections:

```json
{
  "id": "rec_003",
  "imageUrl": "https://example.com/reports/rec_003.jpg",
  "bottleName": "Bulleit Bourbon",
  "category": "bourbon",
  "upc": "082000766876",
  "volumeMl": 750,
  "fillPercent": 60,
  "corrected": true,
  "status": "reviewed",
  "originalModelOutput": {
    "bottleName": "Bulliet Bourbon",
    "category": "bourbon",
    "upc": "082000766876",
    "volumeMl": 750,
    "fillPercent": 70
  },
  "correctedValues": {
    "bottleName": "Bulleit Bourbon",
    "category": "bourbon",
    "upc": "082000766876",
    "volumeMl": 750,
    "fillPercent": 60
  }
}
```

Important interpretation rule:
- these are the kinds of objects you are designing around
- these are not invitations to invent more fields
- stay in bottle-report land


==================================================
58. CANONICAL COPY AND LABEL PACK
==================================================

If you need example strings, copy the spirit of these.

Entry screen:
- BARBACK
- Reports Workbench
- Open recent reports and inspect records from desktop.
- Open Reports
- Live access requires venue and user context.

Reports list:
- Reports
- Review recent reports and open one to inspect records.
- Report ID
- Status
- Operator
- Started
- Completed
- Bottle Count

Created screen:
- Report 1a2b3c4d-5e6f-7081-9201-1k2l3m4n5o6p
- created
- Report created. Records are not available yet.

Processing screen:
- Report 550e8400-e29b-41d4-a716-446655440000
- processing
- Processing

Unreviewed screen:
- Report f47ac10b-58cc-4372-a567-0e02b2c3d479
- unreviewed
- Bottle match
- Fill level
- Submit Review

Reviewed screen:
- Report 8b3c6b41-2856-429a-b8fc-7c6530b138e6
- reviewed
- Original model output
- Corrected values

Failed-emphasis screen:
- Failed record
- Error code
- Error message

Blocked screen:
- Access Unavailable
- Review submission requires user context.
- Back to Reports

Not-found screen:
- Report Not Found
- This report could not be found.
- Back to Reports

These examples are intentionally plain.
Do not enrich them into something grander.


==================================================
59. HARD FAILURE CONDITIONS
==================================================

Treat the output as failed if any of the following appear:
- an invented top-level product area
- an invented route destination
- an invented field not backed by the shared types
- an invented report status
- an invented record status
- an invented global action
- an invented report title like an audit or shift name
- any finance-document comparison content
- any archive or settlement framing
- any profile or notification chrome
- any support, docs, or status utility area

Treat the output as failed if any screen does any of the following:
- turns a report page into a dashboard
- turns a reviewed page into a certificate
- turns a failed page into an incident console
- turns a comparison page into a document-extraction demo
- turns a blocked page into a setup wizard
- turns a sparse page into a filler-card collage

If you are uncertain whether something is a failure:
- compare it against the canonical sample data pack
- compare it against the exact field inventory
- compare it against the narrow noun dictionary

If it does not clearly survive those comparisons, omit it.


==================================================
60. FINAL VALIDATION CHECKLIST
==================================================

Before finalizing the design, validate all of the following:

1. Does every visible thing map directly to the backend truth described above?
2. Are all statuses named exactly as the backend names them?
3. Is BARBACK mobile clearly the visual parent?
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
