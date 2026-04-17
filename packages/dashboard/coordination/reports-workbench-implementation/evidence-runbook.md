# Evidence Runbook

## Purpose

This is the operational version of `review-evidence-protocol.md`.

The protocol defines the standard.
This runbook defines when to create evidence, what minimum bundle to leave behind, and whether execution may continue after review.

## Core Rule

If a pass changed visible UI in a meaningful way, it needs evidence before it is considered complete.

## When Evidence Is Mandatory

Create or update an evidence bundle when a pass changes:

- tokens
- shell composition
- typography hierarchy
- reports list layout
- detail family layout
- record card structure
- review controls
- status chips
- visible copy
- route/state visibility
- responsive behavior

## When Evidence Can Wait

Evidence may wait until the next visible checkpoint for:

- pure refactors
- type-only changes
- test-only changes
- route/test harness cleanup with no visible screen changes

Do not let "can wait" turn into "never happened."

## Minimum Bundle Per Screen Family Pass

Each evidence bundle should contain:

- `summary.md`
- `checklist.md`
- `screens/`

Use the dated folder contract from `review-evidence-protocol.md`.

## Minimum Capture Sets

### Shell And List Pass

Capture at minimum:

- `01-entry.png`
- `02-reports-list.png`
- `03-reports-empty.png`

### Detail Family Pass

Capture at minimum:

- `04-report-created.png`
- `05-report-processing.png`
- `06-report-unreviewed.png`
- `07-report-reviewed.png`
- `08-report-comparison.png`
- `09-report-failed.png`
- `10-report-blocked.png`
- `11-report-not-found.png`

### Responsive Pass

Add tablet and narrow captures when:

- shell spacing changed
- row layout changed
- detail-card structure changed
- overflow/collapse behavior changed

## Verdict Rules

### `pass`

Use when:
- the screen is visually close enough
- the semantics are correct
- the family resemblance is intact

Execution may continue.

### `pass-with-notes`

Use when:
- the semantics are correct
- the visible actions are correct
- the drift is minor polish, spacing, or line-wrap quality

Execution may continue.
The note should be carried forward.

### `fail`

Use when:
- the actions are wrong
- the nouns are wrong
- the screen family drifted
- unsupported scope leaked back in
- state visibility is wrong
- the screen no longer feels like the approved route/state

Execution should not continue past that screen family as if it were done.

## Overnight Continuation Rule

For an unattended run:

- continue after `pass`
- continue after `pass-with-notes`
- stop after `fail`

Do not silently downgrade a real failure into a note.

## Test Pairing Rule

Every evidence bundle should record the relevant tests run for that pass.

At minimum:
- route tests for route/state changes
- component or interaction tests for control changes
- view-model tests for derivation changes when relevant

## Bundle Notes Rule

`summary.md` should name:

- what changed
- what was captured
- what still looks off
- whether execution continued past the pass

If execution continued on `pass-with-notes`, say so explicitly.

## Minimal Overnight Discipline

For a long unattended run, do not create evidence after every microscopic styling change.

Instead, create evidence after:

- shell/list checkpoint
- detail-family checkpoint
- any major responsive checkpoint

This keeps the evidence real without turning the run into screenshot bureaucracy.

## Success Condition

This runbook is working if a long implementation pass leaves behind durable proof at the right checkpoints, and the evidence standard slows semantic drift without strangling momentum.
