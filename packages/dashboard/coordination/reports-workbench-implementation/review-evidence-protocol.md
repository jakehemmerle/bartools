# Review Evidence Protocol

This document defines the proof required for UI work.

It exists because "I looked at it locally" is not evidence.

If a pass changes the visual product and leaves behind no durable proof, that pass is not review-complete.

## Core Rule

No screenshot, no visual pass.

No route list, no state pass.

No written verdict, no merge confidence.

## Evidence Folder Contract

Each meaningful UI pass should produce an evidence bundle at:

`packages/dashboard/coordination/reports-workbench-implementation/review-evidence/<YYYY-MM-DD>-<short-slug>/`

Example:

`packages/dashboard/coordination/reports-workbench-implementation/review-evidence/2026-04-16-report-shell-pass/`

Each evidence bundle should contain:
- `summary.md`
- `checklist.md`
- `screens/`

Recommended optional files:
- `notes.md`
- `diff-observations.md`

## Screenshot Naming Contract

Inside `screens/`, use stable names that map to approved screen families:
- `01-entry.png`
- `02-reports-list.png`
- `03-reports-empty.png`
- `04-report-created.png`
- `05-report-processing.png`
- `06-report-unreviewed.png`
- `07-report-reviewed.png`
- `08-report-comparison.png`
- `09-report-failed.png`
- `10-report-blocked.png`
- `11-report-not-found.png`

If only a subset changed, include the subset that changed plus any adjacent shared-shell screens affected by the same pass.

Examples:
- if the top shell changes, capture every route family that uses it
- if the review card changes, capture unreviewed, failed, reviewed, and comparison
- if token values change, capture every approved screen

## Summary File Contract

`summary.md` should answer:
- what changed
- which screens were intentionally touched
- which screens were captured
- which review gates were exercised
- what still looks off

Keep it short, but concrete.

## Checklist File Contract

`checklist.md` should contain one row per reviewed screen using this structure:

| Screen | Route | Golden Reference | Screenshot | Visual Verdict | Semantic Verdict | Notes |
| --- | --- | --- | --- | --- | --- | --- |

Allowed verdict values:
- `pass`
- `pass-with-notes`
- `fail`

If a screen failed, keep it in the checklist anyway.
Do not quietly omit the losing screen because it is inconvenient.

## Required Capture Context

Each capture pass should record:
- date
- branch name
- commit hash if available
- viewport used
- whether the route is a real route or a review route
- relevant test commands run

Put this at the top of `summary.md`.

## Viewport Contract

Primary required viewport for golden-set comparison:
- desktop width around `1440px`

Additional responsive captures are required when:
- shell spacing changed
- list rows changed
- detail cards changed
- overflow behavior changed

Recommended additional viewports:
- tablet around `768px`
- narrow/mobile around `390px`

The approved golden set is desktop-first.
Desktop evidence is mandatory.
Responsive evidence is conditional but should be added whenever layout work could drift.

## Review Ritual Per UI Pass

For every meaningful UI pass:

1. open the relevant review routes
2. capture screenshots
3. compare each captured screen to the approved golden reference
4. complete `checklist.md`
5. note any allowed deviations and any failures in `summary.md`
6. run the relevant tests
7. record the test commands and verdicts

If step 4 or step 7 is skipped, the pass is incomplete.

## What Counts As A Meaningful UI Pass

This protocol is required when a change touches:
- tokens
- shell layout
- typography
- row composition
- record card composition
- review controls
- status chips
- copy
- route visibility
- responsive behavior

This protocol is optional for:
- pure refactors with no visible behavior change
- type-only changes with no route effect

If unsure, create evidence anyway.

## Acceptance Thresholds

### Must Match Exactly

- route and state coverage
- visible actions
- product nouns
- report status semantics
- review submission model
- unsupported-surface hiding

### Must Match Closely

- typography hierarchy
- shell composition
- surface layering
- spacing rhythm
- visual emphasis order
- calm operational tone

### Allowed To Vary Slightly

- exact placeholder imagery
- line wrapping caused by real data lengths
- minor responsive spacing adjustments that preserve hierarchy
- implementation-specific focus rings, if they stay within the token system

## Failure Handling

When a screen does not match:
- mark `fail` in `checklist.md`
- describe the drift plainly
- do not pretend it is "close enough" without naming the mismatch

Common failure examples:
- generic admin table chrome reappears
- wrong nouns appear
- a reviewed screen still has edit controls
- blocked state renders fake report content
- entry screen implies auth or signup support

## Relationship To Review Gates

This protocol is the evidence layer for:
- `backpressure-and-review-gates.md`
- `state-visibility-matrix.md`
- `visual-token-spec.md`

Those docs define what "correct" means.
This protocol defines how correctness gets proved.

## Minimal Merge Standard For UI Work

Before UI work is considered review-ready, the branch should have:
- updated screenshots for the changed screens
- a completed `checklist.md`
- written notes for any remaining drift
- relevant tests run and recorded

Without those artifacts, the branch may still be useful, but it is not evidence-backed.
