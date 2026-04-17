# Planning Status

## Purpose

This document answers three questions:

1. what planning artifacts are authoritative right now
2. what planning work is already strong enough
3. what planning work still needs to happen before we leave planning mode with confidence

This exists because the repo still contains older coordination docs from the earlier full-dashboard/Mantine phase, while the current implementation target is a narrower reports-first workbench aligned to backend truth and mobile-led design.

Without an explicit status document, it is too easy to accidentally read an older backlog or phase plan as current execution truth.

## Current Planning Posture

Status:

- planning-complete enough to build
- not blocked on product definition
- no longer blocked on the absence of a live ticket layer
- no missing core planning artifact remains
- remaining planning work is optional tightening and historical cleanup

The memory sidequest is intentionally deferred.

It may become useful later as process improvement work, but it is not the current planning bottleneck for the dashboard.

## Current Source Of Truth

For the current web build, planning truth should be read in this order:

1. backend reality for functional nouns and supported workflows
2. approved visual reference in `packages/dashboard/coordination/golden-set-approved/`
3. current execution-facing planning in `packages/dashboard/coordination/reports-workbench-implementation/`
4. older coordination docs only when historical context is useful

### Product Truth

Product semantics should remain anchored to:

- `packages/dashboard/specs/`
- current backend-supported reports workflow

The web app should not invent product behavior that the backend and mobile app do not already justify.

### Visual Truth

Visual truth should remain anchored to:

- `packages/dashboard/coordination/golden-set-approved/`
- `packages/dashboard/coordination/stitch_handoff_selection.md`

### Execution Truth

Execution truth should remain anchored to:

- `packages/dashboard/coordination/reports-workbench-implementation/README.md`
- `packages/dashboard/coordination/reports-workbench-implementation/implementation-principles.md`
- `packages/dashboard/coordination/reports-workbench-implementation/screen-inventory.md`
- `packages/dashboard/coordination/reports-workbench-implementation/screen-composition-spec.md`
- `packages/dashboard/coordination/reports-workbench-implementation/state-visibility-matrix.md`
- `packages/dashboard/coordination/reports-workbench-implementation/architecture-and-file-plan.md`
- `packages/dashboard/coordination/reports-workbench-implementation/component-map.md`
- `packages/dashboard/coordination/reports-workbench-implementation/visual-token-spec.md`
- `packages/dashboard/coordination/reports-workbench-implementation/review-evidence-protocol.md`
- `packages/dashboard/coordination/reports-workbench-implementation/code-quality-gates.md`
- `packages/dashboard/coordination/reports-workbench-implementation/backpressure-and-review-gates.md`
- `packages/dashboard/coordination/reports-workbench-implementation/execution-plan.md`
- `packages/dashboard/coordination/reports-workbench-implementation/ticket-backlog.md`
- `packages/dashboard/coordination/reports-workbench-implementation/implementation-kickoff-checklist.md`
- `packages/dashboard/coordination/reports-workbench-implementation/autonomy-envelope.md`
- `packages/dashboard/coordination/reports-workbench-implementation/dependency-decision-policy.md`
- `packages/dashboard/coordination/reports-workbench-implementation/architecture-defaults.md`
- `packages/dashboard/coordination/reports-workbench-implementation/visual-deviation-policy.md`
- `packages/dashboard/coordination/reports-workbench-implementation/evidence-runbook.md`
- `packages/dashboard/coordination/reports-workbench-implementation/scaffolding-backlog.md`
- `packages/dashboard/coordination/reports-workbench-implementation/phase-1-2-file-checklist.md`

## Historical But Non-Authoritative Planning

The following docs are still useful for history, rationale, and older sequencing decisions, but they should not drive new implementation decisions unless they are explicitly reconciled with the reports-workbench plan:

- `packages/dashboard/coordination/implementation-plan.md`
- `packages/dashboard/coordination/phase-0-1-breakdown.md`
- `packages/dashboard/coordination/phase-2-4-breakdown.md`
- `packages/dashboard/coordination/phase-5-10-breakdown.md`
- `packages/dashboard/coordination/execution-backlog.md`
- `packages/dashboard/coordination/ticket-backlog.md`
- `packages/dashboard/coordination/readiness.md`

Why:

- they describe the older broader dashboard scope
- they still assume Mantine in multiple places
- they include routes and surfaces that are no longer the active web product
- they do not cleanly reflect the current reports-first, React Aria, backend-truth build

These docs are not wrong as history.
They are just not the live execution layer anymore.

## Planning That Is Already Strong

The following planning areas are in good shape:

### 1. Design Fidelity Backpressure

We already have:

- approved screen bundle
- screen inventory
- screen composition spec
- visual token spec
- review evidence protocol

This is strong enough to keep the UI from drifting casually.

### 2. Semantic Backpressure

We already have:

- implementation principles
- state visibility matrix
- screen-by-screen semantics
- backend-truth framing for reports, venues, locations, and review flows

This is strong enough to keep the web app from re-inventing old dashboard semantics.

### 3. Architectural Backpressure

We already have:

- architecture and file plan
- component map
- architecture renegotiation protocol
- code-quality gates
- backpressure and review gates

This is strong enough to make accidental architecture drift harder than conscious architecture decisions.

### 4. Early Execution Shape

We already have:

- execution plan
- scaffolding backlog
- phase 1-2 file checklist

This is enough to understand the first implementation passes at a high level.

## Planning That Is Still Weak

The remaining weakness is not product definition.
It is execution specificity.

### 1. The Live Execution Backlog Is Split Across Eras

We have an old root execution backlog and a newer reports-workbench execution plan.

That means someone can still accidentally start from the wrong slice list.

The new `reports-workbench-implementation/ticket-backlog.md` solves the ticket-size side of this problem, but the older root backlog docs still exist and still need to be treated as historical.

### 2. Historical Coordination Docs Can Still Waste Attention

We have a live reports-workbench backlog now, but the older coordination docs still exist at the root.

That means a distracted future pass could still pull in old assumptions unless we keep the authority stack explicit.

## Recommended Next Planning Work

The highest-value next planning sequence is:

1. keep the implementation kickoff checklist current as the first execution passes land
2. add a simple historical-note/deprecation pass later only if it still feels necessary

### Next Artifact 1: Implementation Kickoff Checklist

This now exists and should stay brutally practical:

- files we expect to touch first
- review routes that must exist before visual fidelity work
- fixtures/scenarios that must exist before detail-state work
- test cases that must land with each early slice
- dependency-touch red flags that require explicit user approval

### Optional Later Artifact: Historical Doc Reconciliation

If confusion persists, we can later add small notices to older coordination docs clarifying that they are historical.

That is useful housekeeping, but it is lower value than getting the live ticket layer right.

## Definition Of Planning-Complete Enough

We should consider planning complete enough to move forward when all of the following are true:

- the current authority stack is explicit
- the reports-workbench ticket backlog exists
- the first implementation stretch is sliced into reviewable, current-state tickets
- the first pass can start without needing to reinterpret historical docs
- visual, semantic, and architectural backpressure remain stronger than convenience

Those conditions are now met.

## Recommended Immediate Move

The immediate next planning move should be:

- begin implementation from the opening chain in `ticket-backlog.md`
- keep the kickoff checklist current if the first execution passes reveal hidden work

The live ticket backlog exists.
The kickoff checklist exists.
The remaining value is now in execution discipline, not more broad planning.
