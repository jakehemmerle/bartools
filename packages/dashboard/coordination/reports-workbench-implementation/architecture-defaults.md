# Architecture Defaults

## Purpose

This document defines the default architectural choices to make when the codebase presents more than one plausible path.

It exists so the implementation can keep moving without silently renegotiating the architecture every time the code gets annoying.

## Core Rule

If the current planning docs already imply a direction, choose that direction and continue.

If the code fights the plan, choose the narrowest option that preserves:
- backend truth
- current product scope
- current file ownership boundaries
- current review methodology

## Default Choices

### 1. Prefer Reports-Only Scope

If older dashboard scaffolding competes with the current reports workbench, choose the reports workbench.

Default action:
- isolate, redirect, or delete old broader-dashboard behavior

Do not:
- preserve unsupported surfaces just because they already exist

### 2. Prefer Deletion Or Quarantine Over Compatibility Wrappers

When legacy dashboard code is no longer part of the active build, prefer:
- deleting it
- isolating it
- clearly demoting it to historical status

Do not default to:
- compatibility wrappers
- forwarding layers
- "temporary" bridges that quietly become permanent

### 3. Prefer Feature-Local Ownership Over App-Global Abstractions

When deciding where code should live, prefer:
- `features/reports/` for reports-specific rendering and view logic
- `components/primitives/` for stable reusable presentation primitives
- `components/shell/` for shell ownership

Do not default to:
- app-global helpers
- generic shared abstractions
- new top-level folders created for one-off convenience

### 4. Prefer View-Model Helpers Over Inline Render Logic

When a route or screen is doing too much formatting or derivation:
- extract a named view-model helper

Do not default to:
- stuffing more derivation into JSX
- creating a generic `utils.ts`

### 5. Prefer Local State Over New State Architecture

If the current reports client boundary and feature-local state can solve the problem, use them.

Do not default to:
- app-global stores
- new cross-feature state layers
- new state libraries

### 6. Prefer Report-Level Review Truth

If UI implementation tempts a per-record action pattern, choose the report-level model.

Default action:
- collect record decisions locally
- keep one report-level submit action

### 7. Prefer Disabled Or Blocked UI Over Fake Capability

If a real backend path is gated, choose:
- blocked explanation
- disabled action
- truthful narrow flow

Do not choose:
- fake enabled actions
- speculative wiring
- made-up backend support

### 8. Prefer Review Routes Over Branching Tricks

If a state needs deterministic visual review, prefer:
- explicit scenario
- explicit review route

Do not prefer:
- hidden query-string tricks
- local data mutation rituals
- brittle manual setup

### 9. Prefer Product Primitives Over One-Off Styling

If a visual pattern appears twice or more, prefer:
- strengthening a local BARBACK primitive

Do not prefer:
- copying CSS fragments into multiple screens
- introducing a generic component API before there is a real second consumer

### 10. Prefer Testing The Contract, Not The Incidental Markup

If a new test is needed, default to:
- route behavior
- scenario coverage
- interaction truth
- payload truth
- view-model derivation

Do not default to:
- snapshots
- shallow render theater

## Tie-Break Rules

When two paths both fit the plan, choose in this order:

1. the path with less scope
2. the path with clearer file ownership
3. the path with less legacy baggage
4. the path that is easier to test
5. the path that is easier to visually review

## When Defaults Stop Applying

These defaults are for routine implementation choices.

Stop and use `architecture-renegotiation-protocol.md` if the best path would alter:
- the route model
- the reports client boundary
- the fixture/review route strategy
- the shell/primitives/features/lib ownership model
- the locked review model

## Success Condition

These defaults are working if the implementation gets simpler as it moves forward, older baggage shrinks instead of spreading, and the codebase becomes more obviously shaped around the reports workbench rather than around its own history.
