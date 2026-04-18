# Architecture Renegotiation Protocol

This document exists to preserve one specific kind of honesty:

If we change the architecture, we should say that we changed the architecture.

The problem is not renegotiation itself.
The problem is silent renegotiation that shows up later as drift, surprise, and fake consensus.

## Core Rule

Architecture is allowed to change.

Architecture is not allowed to drift.

If an architectural decision is no longer the right one, we consciously replace it.
We do not slowly bypass it through local convenience.

## What Counts As Architecture Here

For this project, architecture includes:
- the routing model
- the real-route versus review-route split
- the reports client boundary
- the fixture strategy for reviewable states
- the state model for reports, records, and review drafts
- the shell and primitive layering strategy
- the choice to use React Aria for behavior and local styling for visible design
- the decision to remove Mantine from the visible product layer
- the file ownership boundaries between `app`, `components`, `features`, and `lib`

## Locked Decisions Right Now

These decisions are locked until consciously changed:

1. The backend is the source of truth for functionality.
2. The mobile app is the source of truth for design language.
3. The active web product is a reports-first workbench, not a general dashboard.
4. Unsupported surfaces stay hidden or redirected rather than remaining as fake product pages.
5. React Aria is the behavior and accessibility layer.
6. BARTOOLS-owned styling and components define the visible product language.
7. Review remains report-level, not per-record submit.
8. Fixtures and review routes are required for deterministic visual iteration.

## Valid Triggers For Renegotiation

A renegotiation is warranted when at least one of these is true:
- the backend contract changed in a way the current frontend architecture cannot absorb cleanly
- the approved mobile or web design direction makes the current component layering unworkable
- accessibility requirements are materially harmed by the current approach
- testability is materially harmed by the current approach
- performance or maintainability costs are high enough that the current shape is actively in the way
- a supposedly "local" change actually changes a shared contract, shared primitive, or review methodology

## Invalid Triggers For Renegotiation

These are not sufficient reasons by themselves:
- "this library already has a component for that"
- "it was faster in the moment"
- "the old screen was close enough"
- "it reduced one file's complexity"
- "I already had the code around"
- "the mockup is annoying"

Those may explain pressure.
They do not justify silent architecture changes.

## Renegotiation Procedure

When an architecture decision needs to change:

1. stop and name the pressure clearly
2. write a decision note in `packages/dashboard/coordination/reports-workbench-implementation/decisions/`
3. state the old decision, the new decision, and why the old one failed
4. list the alternatives considered
5. describe impact on files, tests, review routes, and backpressure
6. update the planning docs in the same change set as the implementation change, or before it
7. only then continue implementation on the new path

If step 6 does not happen, the renegotiation is incomplete.

## Decision Note Naming

Use this naming pattern:

`YYYY-MM-DD-short-kebab-name.md`

Examples:
- `2026-04-16-replace-fixture-registry-shape.md`
- `2026-04-21-move-review-routes-under-dev-shell.md`

## Minimum Decision Note Contents

Each decision note should include:
- title
- date
- status
- context
- old decision
- pressure or failure mode
- options considered
- chosen decision
- consequences
- docs that must now be updated
- tests or review evidence impacted

## Fast Test For "Do We Need The Protocol?"

Use the protocol if the change would alter any of these questions:
- what routes exist?
- what data shape does a page consume?
- what layers own styling versus behavior?
- what fixtures are canonical?
- what review evidence is required?
- what counts as a reviewable state?

If the answer is yes, use the protocol.

## Examples Of Changes That Require Renegotiation

- moving away from React Aria
- reintroducing a visual component library layer
- changing the review route strategy
- switching from fixture-driven review states to ad hoc page branching
- collapsing `features/reports` state into app-global state for convenience
- adding real unsupported surfaces back into the app shell
- changing the review submission model from report-level to per-record

## Examples Of Changes That Do Not Require Renegotiation

- extracting a helper function inside an existing file boundary
- renaming a local variable
- improving CSS organization without changing the token system
- replacing one internal component with another while preserving the same ownership boundary and visible behavior

## Relationship To Backpressure

This protocol is part of the backpressure system.

Its job is to make sure architecture changes:
- happen consciously
- leave behind a written trail
- update the enforcement docs that implementation depends on

Without this protocol, architectural drift will disguise itself as momentum.

## Failure Conditions

The branch should be treated as architecturally out of sync if:
- code behavior changed but the planning docs still describe the old shape
- a shared boundary moved without a decision note
- review routes or fixture strategy changed with no documentation update
- a library started dictating visible product structure again

## Implementation Rule

When code and docs disagree, do not rely on memory or chat history.

Either:
- update the docs to match the consciously chosen architecture

or:
- restore the implementation to the documented architecture

There should be no third state where everyone "basically knows" what the app is supposed to be.
