# State Visibility Matrix

This document locks what each route and each report state is allowed to show.

It exists to kill three common sources of drift:
- adding UI just because the component already exists
- hiding product ambiguity inside "generic state panels"
- letting unsupported actions survive because they seem harmless

If a screen is visually strong but violates this matrix, it is still wrong.

## Scenario Inventory

Each approved screen should map to one named scenario.

| Scenario | Review Route | Canonical Input | Notes |
| --- | --- | --- | --- |
| entry | `/__review/entry` | no report data | public entry shell only |
| reports-list | `/__review/reports/list` | `ReportListItem[]` with mixed statuses | primary index state |
| reports-empty | `/__review/reports/empty` | empty `ReportListItem[]` | calm empty state |
| report-created | `/__review/report/created` | `ReportDetail.status = created` | no reviewable records |
| report-processing | `/__review/report/processing` | `ReportDetail.status = processing` | progress visible, review blocked |
| report-unreviewed | `/__review/report/unreviewed` | `ReportDetail.status = unreviewed` with reviewable records | primary review workflow |
| report-reviewed | `/__review/report/reviewed` | `ReportDetail.status = reviewed` | resolved report state |
| report-comparison | `/__review/report/comparison` | `ReportDetail.status = reviewed` with original and corrected values present | comparison-emphasis reviewed state |
| report-failed | `/__review/report/failed` | `ReportDetail.status = unreviewed` with at least one failed record | recoverable manual review state |
| report-blocked | `/__review/report/blocked` | integration gate active | not a backend report status |
| report-not-found | `/__review/report/not-found` | missing report id | calm missing state |

## Real Route Behavior

| Real Route | Allowed Screen Family | Not Allowed |
| --- | --- | --- |
| `/` | entry | auth funnel, inventory dashboard, settings teaser |
| `/reports` | reports list, reports empty | inventory list, metrics overview, pagination chrome |
| `/reports/:reportId` | created, processing, unreviewed, reviewed, comparison-emphasis, failed-emphasis, blocked, not-found | settings panels, unrelated venue tools, per-record submit flow |

## Reports List Composition Contract

The reports list is not an implementation detail.
It is a designed surface with locked content expectations.

Each row must show:
- report identity
- status chip
- location name if available
- operator name if available
- started timestamp
- completed timestamp when available
- bottle count
- clear enter-detail affordance

Each row must not show:
- inventory totals
- export buttons
- per-row secondary menus by default
- pagination for MVP
- fake venue management controls

The list surface must feel like a custom row composition, not a stock spreadsheet or admin data table.

## Detail Shell Matrix

Legend:
- `R` means required
- `A` means allowed when the fixture has supporting data
- `H` means hidden

| Element | Created | Processing | Unreviewed | Reviewed | Comparison | Failed | Blocked | Not Found |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| report title or report id header | R | R | R | R | R | R | H | H |
| report status chip | R | R | R | R | R | R | H | H |
| metadata slab | R | R | R | R | R | R | H | H |
| created explainer | R | H | H | H | H | H | H | H |
| progress block | H | R | H | H | H | H | H | H |
| record list | H | H | R | R | R | R | H | H |
| original model output section | H | H | A | A | R | A | H | H |
| final corrected values section | H | H | H | R | R | H | H | H |
| failed error panel | H | H | A | H | A | R | H | H |
| product match control | H | H | R | H | H | R | H | H |
| fill tenths control | H | H | R | H | H | R | H | H |
| report-level submit review | H | H | R | H | H | R | H | H |
| disabled blocked-state submit button | H | H | H | H | H | H | R | H |
| back-to-reports navigation action | H | H | H | H | H | H | R | R |
| blocked explainer | H | H | H | H | H | H | R | H |
| not-found explainer | H | H | H | H | H | H | H | R |

## Record-State Rendering Matrix

This matrix defines how an individual record is allowed to render inside a report detail screen.

| Record State | Allowed Screens | Must Show | Must Hide |
| --- | --- | --- | --- |
| `pending` | processing only if records are rendered at all | pending status, placeholder or in-flight treatment, no final value claim | corrected values, review controls, success framing |
| `inferred` | unreviewed, comparison | model output, inferred status or equivalent review-ready presentation, image if present | final corrected values unless already reviewed |
| `failed` | unreviewed, failed, comparison if original failure is part of the reviewed history | error block, recovery framing, image fallback if needed | catastrophic copy, dead-end tone, per-record submit |
| `reviewed` | reviewed, comparison | final corrected values, reviewed status, original output only when comparison data exists | interactive review controls |

## Review Interaction Matrix

| Interaction | Created | Processing | Unreviewed | Reviewed | Comparison | Failed | Blocked | Not Found |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| choose product match | H | H | R | H | H | R | H | H |
| choose fill tenths | H | H | R | H | H | R | H | H |
| submit full report review | H | H | R | H | H | R | H | H |
| edit prior decision | H | H | R | H | H | R | H | H |
| follow progress passively | H | R | H | H | H | H | H | H |

Rules:
- review submission is report-level only
- there is never a per-record submit button
- fill choice is discrete tenths `0` through `10`
- the visible control language should never regress to percentages or decimals

## Required Copy Visibility Rules

These rules are intentionally strict.

### Entry

Must include:
- reports-workbench framing
- a narrow call to enter the reports surface

Must not include:
- signup claims
- backend capabilities we do not have
- planning or implementation language

### Reports List And Empty

Must include:
- reports-first framing
- calm operational tone

Must not include:
- "inventory dashboard"
- "command center"
- "analytics"
- "settings"
- "MVP"
- "fixture"
- "mock"

### Detail States

Must include:
- backend-truth nouns such as `report`, `record`, `bottle`, `review`

Must not include:
- `session`
- `inventory report`
- `capture batch`
- `dev server`
- `fixture data`
- `placeholder state`

## Comparison Rules

The comparison-emphasis screen is not just "reviewed plus extra text."

It must:
- visually distinguish original model output from final corrected values
- keep the corrected values as the final truth
- use original output as audit context, not as competing truth

It must not:
- make both columns look equally current
- present comparison controls as editable after review
- turn into a generic diff viewer

## Failed-State Rules

The failed-emphasis screen is not an outage screen.

It must:
- treat failure as recoverable review work
- keep product match and fill choice available
- preserve the same overall detail family as other report states

It must not:
- use emergency language
- imply the report is unusable
- replace the report-level review action with per-record "fix" buttons

## Blocked And Not-Found Rules

### Blocked

Blocked means:
- the frontend is not allowed to activate the backend path yet because venue and user context are missing

Blocked must show:
- a calm explanation
- same product family and shell
- a disabled submit button as context, not as an active review affordance
- a back-to-reports navigation action

Blocked must hide:
- fake report metadata
- fake records
- fake review controls

### Not Found

Not found means:
- the requested report cannot be resolved

Not found must show:
- same product family
- a missing-state explanation
- a back-to-reports navigation action

Not found must hide:
- fake fallback data
- generic app errors

## Review-Draft Completeness Rules

The report-level submit action may render only when the page is reviewable.

The submit action should be:
- visible on unreviewed and failed states
- disabled until the draft satisfies the frontend validation rule
- enabled only when every actionable record has a `bottleId` and `fillTenths`

The submit action should not:
- appear in created, processing, blocked, not-found, or reviewed states
- silently submit partial decisions

## Anti-Drift Questions

After any state-related implementation change, ask:

1. Did we show an action on a screen that should only be informational?
2. Did we hide context that the approved screen relies on?
3. Did a reviewed screen accidentally retain editing affordances?
4. Did a blocked or not-found screen start rendering fake report content because it looked nicer?
5. Did any old session-era noun creep back into a visible label?
