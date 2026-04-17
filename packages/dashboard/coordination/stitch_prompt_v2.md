# Stitch Prompt: BARBACK Web Dashboard

Use the following prompt in Stitch.

```text
Design only a narrow desktop report-review workbench for BARBACK.

Do not design a general dashboard.
Do not design an admin console.
Do not design a SaaS back office.
Do not design a command center.
Do not design a marketing site.
Do not design a settings app.
Do not design an inventory management suite.

Primary visual reference:
https://stitch.withgoogle.com/projects/18269116219514012906

Treat the linked Stitch project as visual reference only.
Use it for brand, typography mood, color language, surface treatment, density, and overall product feel.
Do not treat it as a source of truth for:
- information architecture
- page set
- navigation
- actions
- workflows
- metrics
- utility chrome
- product scope

If the linked project contains any page, module, navigation, metric, action, or concept not explicitly allowed in this prompt, ignore it.

The mobile BARBACK app is the source of truth for design.
The backend reports workflow is the source of truth for functionality.

If mobile design language conflicts with generic desktop dashboard conventions:
- follow mobile

If backend functional truth conflicts with a “better” or “richer” imagined desktop UX:
- follow backend

If you are uncertain whether something is allowed:
- omit it

Assume there is no hidden functionality beyond what is described here.
Do not design for speculative future backend capabilities.


========================================
1. CORE PRODUCT TRUTH
========================================

This web surface is a desktop companion to BARBACK mobile.

It is for one job:
- reviewing reports

Its purpose is only:
- scan the list of reports
- open one report
- understand that report’s status
- inspect individual report records
- compare original inferred values against corrected final values
- understand failed records
- prepare review decisions for unreviewed reports

It is not for:
- running the business
- managing the venue
- managing inventory broadly
- tracking performance
- managing users
- configuring settings
- viewing analytics
- browsing a multi-product workspace

The design must feel narrower than a dashboard and more focused than a generic admin panel.
It should feel like a review desk, not a control center.


========================================
2. FUNCTIONAL SOURCE OF TRUTH
========================================

Backend-supported surfaces:
- reports list
- report detail
- report progress / streaming state
- report review state
- bottle search for review correction
- venue location as supporting context only

Core entity:
- report

Secondary entity:
- report record

Report statuses:
- created
- processing
- unreviewed
- reviewed

Report record statuses:
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

Important naming rule:
- the primary identity of a report is its report ID
- do not invent human-readable report titles like “Zone B Audit”
- do not invent named audit labels, campaign names, or shift titles
- location may appear only as supporting metadata if present
- operator name may appear only if userDisplayName is available

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

Important per-record rule:
- do not invent extra per-record metadata such as camera labels, station tags, variance class, confidence badges, or device source
- only show per-record metadata that maps directly to the allowed fields above

Original/corrected model output fields available:
- bottleName
- category
- upc
- volumeMl
- fillPercent

Report progress fields available:
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

Review payload shape that the UI must respect:
- userId
- records[]
- each record contains:
  - id
  - bottleId
  - fillTenths

This means the review UI may only imply these editable decisions:
- choose a bottle match
- choose fill level in 10% increments / tenths

Every visible metric, field, badge, control, action, and status in the design must map directly to one of the fields, routes, or states described in this prompt.

If a visible UI element does not map directly to a backend field, backend route, or backend state listed here:
- do not include it


========================================
3. ABSOLUTE FORBIDDEN SCOPE
========================================

Do not design active product surfaces for:
- inventory
- low stock
- settings
- signup
- signin
- password reset
- onboarding
- account management
- profile management
- team management
- permissions
- support center
- logs
- notifications center
- analytics
- trends
- KPI dashboards
- venue switcher
- venue management
- location management
- CSV export center
- AI tuning
- experiment controls
- moderation workflow
- approval workflow
- escalation workflow
- manager review workflow

Do not invent:
- confidence score summary cards
- variance cards
- depletion math
- ounces math
- expected vs actual comparisons beyond fields explicitly listed above
- price or cost calculations
- anomaly taxonomies
- label mismatch taxonomies
- system health panels
- global search across the product
- rich filtering systems
- utility panels
- quick actions
- profile menus
- support links
- logs links
- settings links
- “new report” actions
- extra screens of any kind
- export actions
- download centers
- batch-level toolbars

Do not add:
- a persistent sidebar
- a utility footer navigation
- a profile/avatar area
- a venue portrait
- bartender portraits
- ambience photography
- decorative hospitality photography
- decorative hero imagery

The only images allowed in the design are:
- real report record thumbnails
- subtle non-figurative background or texture treatment if needed

Do not use decorative stock photography.
Do not use venue photos.
Do not use operator photos.
Do not use bar interior photography.


========================================
4. EXACT SCREEN SET
========================================

Produce exactly these screens and no others:

1. Entry surface
2. Reports list
3. Reports list empty state
4. Report detail - created
5. Report detail - processing
6. Report detail - unreviewed
7. Report detail - reviewed
8. Report detail - failed record emphasis
9. Report detail - original vs corrected comparison emphasis
10. Unavailable / blocked state
11. Not found / missing report state

Do not produce:
- additional dashboard overview pages
- component gallery pages
- design system showcase pages
- alternate navigation concepts
- responsive mobile versions
- extra utility pages
- “future state” pages
- optional feature explorations

These 11 screens are the entire output.


========================================
5. TEMPLATE RULE
========================================

There are only three underlying templates:

Template A:
- entry surface

Template B:
- reports list
- reports list empty state

Template C:
- report detail
- report detail created
- report detail processing
- report detail unreviewed
- report detail reviewed
- report detail failed emphasis
- report detail comparison emphasis
- unavailable / blocked
- not found

Important rule:
The detail-related states must all reuse the same structural page template.
Do not redesign the information architecture per state.
Do not create new summary modules for one state and remove them in another.
Do not introduce new navigation in one state.
Do not create different page skeletons for different report statuses.

Only the content within the shared template may change by state.


========================================
6. GLOBAL SHELL RULE
========================================

Use one restrained global shell.

Allowed shell elements:
- BARBACK wordmark / brand marker
- minimal top bar
- current page title context
- optional single back link where relevant

Not allowed in the shell:
- persistent sidebar
- secondary nav rail
- footer utility nav
- profile menu
- support / logs / settings / help links
- notifications
- product switcher
- workspace switcher
- venue switcher

Navigation must be singular and minimal.
The app should feel content-first, not chrome-first.
The shell must not contain search, filters, utility icons, or action menus.


========================================
7. ENTRY SURFACE SPECIFICATION
========================================

The entry surface is not a marketing landing page.
It is not a product explainer.
It is not an account entry flow.

It should be a restrained launch surface for the reports workbench.

It may contain:
- BARBACK identity
- a concise heading
- one short descriptive paragraph
- one primary action leading into reports
- an optional calm note that live access depends on venue/user context

It must not contain:
- multi-card feature marketing
- signup / signin framing
- pricing framing
- testimonials
- product stats
- fake screenshots
- fake feature comparisons
- startup landing page composition

The entry surface should feel like a dark editorial preface page, not a homepage.
The page should be sparse.
Do not add secondary CTAs.
Do not add cards.
Do not add section grids.


========================================
8. REPORTS LIST SPECIFICATION
========================================

The reports list is the home screen of the actual workbench.

It must contain:
- page heading
- one short descriptive sentence
- one primary list or table

It should not contain:
- search fields
- filters
- summary cards
- trends
- analytics
- charts
- KPI blocks
- global actions
- utility actions

Preferred columns:
- Report ID
- Status
- Operator
- Started
- Completed
- Bottle Count

The list should feel:
- dense
- readable
- quiet
- premium
- operational

Do not turn the top of the list page into a dashboard.
No metric bento.
No summary strip.
No cross-venue language.
No “Inventory Reports” framing.

Use “Reports” as the primary page concept.
Row interaction should be simple:
- row click or one minimal “view” affordance
- no actions column with multiple controls


========================================
9. REPORT DETAIL SPECIFICATION
========================================

The report detail page is the center of gravity.

Top region must contain:
- back link to reports
- report identity
- report status
- started/completed/operator metadata where available
- progress only when relevant

Top region must not contain:
- export button
- download button
- approve all button
- global review toolbar
- action clusters beyond a single restrained final review action when appropriate

The main region must contain:
- a vertical list of report record cards

The detail page must not contain:
- dashboard-style summary cards
- KPI tiles
- confidence summaries
- variance summaries
- trend summaries
- secondary navigation
- side utility modules
- support/logs/settings actions

Do not add a right-hand executive summary rail.
Do not add a left-hand workflow rail.
Do not add review-control dashboards.

The page should feel like a document-like inspection surface with structured records.


========================================
10. REPORT RECORD CARD SPECIFICATION
========================================

Every record card should share one consistent anatomy.

Required anatomy:
- record image thumbnail area
- bottle identity area
- metadata line
- fill percent
- record status chip
- optional failed state block
- optional original model output block
- optional corrected values block
- optional review controls block for unreviewed reports

Suggested layout:
- thumbnail on the left
- primary record content to the right
- review controls below the record content, not in a detached dashboard sidecar

Do not place review controls in:
- a floating side panel
- a right-hand inspector
- a sticky moderation tray
- a separate dashboard module above the record list

The card must not contain:
- cost math
- ounces math
- “expected vs calculated” comparisons
- confidence gauge
- severity score
- operator commentary
- assignment
- escalation controls
- bulk moderation affordances
- “verify / reject / flag / accept edit” action cluster

The record card should be easy to scan quickly in a stack.


========================================
11. REVIEW CONTROLS SPECIFICATION
========================================

The review model is intentionally narrow.

For an unreviewed report, each record may show:
- bottle search input
- bottle search result selection affordance
- fill level selection affordance in 10% increments

That is all.

The fill-level affordance should imply 10% increments only.
Do not imply ounce precision, percentage sliders with continuous ranges, or scientific measurement tooling.

The review UI must not imply:
- freeform edits to arbitrary bottle schema
- comments
- issue triage
- approval chains
- reject flows
- escalation
- manager signoff
- “approve all”
- “flag”
- “accept edit”
- “manual override” language that implies broader write powers

The final page-level action may be:
- one restrained final review submission action

If submission is blocked by missing context, the action should appear unavailable in a calm way.
Do not add any secondary page-level actions beyond returning to reports.


========================================
12. STATE-SPECIFIC DETAIL VARIANTS
========================================

Report detail - created:
- same detail template
- no fake progress visualization beyond what the known fields support
- records may appear pending
- quiet, not broken

Report detail - processing:
- same detail template
- use photoCount and processedCount for progress communication
- may show mixture of pending / inferred / failed
- no noisy animation systems

Report detail - unreviewed:
- same detail template
- show inline review controls for each record
- emphasize careful review, not speed-approval

Report detail - reviewed:
- same detail template
- no active editing emphasis
- corrections remain legible
- feels settled and archival

Report detail - failed emphasis:
- same detail template
- failure messaging visible but not melodramatic
- errorCode and errorMessage readable

Report detail - comparison emphasis:
- same detail template
- original model output and corrected final values clearly separated
- use labels and surface treatment, not gimmicks

Across all detail variants:
- no top summary cards
- no synthetic metrics
- no alternate page titles
- no alternate navigation
- no alternate shell


========================================
13. UNAVAILABLE / BLOCKED STATE SPECIFICATION
========================================

This state should communicate one thing:
live access or submission cannot proceed until required venue/user context exists.

It must be:
- calm
- operational
- concise

It must not mention:
- mock mode
- fixtures
- MVP
- roadmap
- engineering work
- backend not ready

Good phrasing direction:
- “Live report access requires venue and user context.”
- “Review submission requires user context.”

Bad phrasing direction:
- “This feature is under development.”
- “Backend integration coming soon.”
- “Mock data mode.”


========================================
14. NOT FOUND STATE SPECIFICATION
========================================

This is a minimal variant of the detail template.

It should:
- keep the same shell
- clearly say the report could not be found
- provide a path back to reports

It should not:
- dramatize failure
- add troubleshooting utilities
- add support links


========================================
15. VISUAL SYSTEM REQUIREMENTS
========================================

Match BARBACK mobile in spirit and in concrete typographic/material choices.

Typography:
- display / major headings: Newsreader
- body copy: Manrope
- labels / metadata / technical uppercase UI: Space Grotesk

Do not use Inter as the main body font.
Do not substitute a generic web font stack if avoidable.

Color direction:
- dark-first
- charcoal / ink surfaces
- warm copper / brass primary
- restrained green for positive reviewed states
- restrained red for failed states
- warm brown-gray neutrals for outlines and muted copy

Use the following values as concrete guidance:
- background: #131313
- surfaceContainerLowest: #0E0E0E
- surfaceContainerLow: #1C1B1B
- surfaceContainer: #20201F
- surfaceContainerHigh: #2A2A2A
- surfaceContainerHighest: #353535
- primary: #FFB782
- primaryContainer: #C7804A

Surfaces:
- tonal separation over loud borders
- small crisp radii
- premium and restrained

Do not produce:
- soft bubbly cards
- bright blue states
- glossy enterprise widgets
- cyberpunk effects
- ornamental luxury clutter

The mood should come from:
- typography
- spacing
- surface contrast
- disciplined use of copper

Not from:
- stock imagery
- fake ambiance photography
- heavy visual gimmicks


========================================
16. COPY REQUIREMENTS
========================================

All copy must be:
- concise
- literal
- operational
- calm
- product-facing

Do not use copy about:
- MVP
- prototypes
- mockups
- internal tools
- dev mode
- fixture mode
- roadmap
- innovation
- transformation
- command center
- optimization platform
- unified venue control
- platform scale

Preferred naming:
- Reports
- Report
- Record
- Report ID
- Original model output
- Final corrected values
- Failed record
- Review

Avoid:
- Inventory Reports
- command center
- operator intelligence
- all venues
- executive language


========================================
17. REQUIRED OUTPUT FORMAT
========================================

Output exactly:
- the 11 screens listed above
- one coherent visual language across them

Do not output:
- extra exploratory variants
- alternate navigation schemes
- component playgrounds
- system manifestos
- strategy notes
- additional product concepts

The result should be implementation-directed, not ideation-directed.


========================================
18. FINAL SUCCESS TEST
========================================

The design succeeds only if all of the following are true:

1. It is unmistakably BARBACK.
2. It visually defers to the linked mobile design language.
3. It functionally stays inside the backend reports workflow and nowhere else.
4. Every visible element maps to a backend field, route, or state described in this prompt.
5. It contains no fake metrics, no fake controls, no fake navigation, and no fake product scope.
6. It feels like a narrow desktop companion workbench, not a separate software business.

If there is any conflict between:
- richer
and
- truer

choose truer.
```
