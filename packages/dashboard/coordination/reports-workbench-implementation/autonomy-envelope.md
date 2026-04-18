# Autonomy Envelope

## Purpose

This document defines how much implementation autonomy is allowed for the BARTOOLS reports workbench.

Its job is to make long-running execution possible without turning "autonomy" into silent drift.

This is especially for unattended or low-interruption implementation passes.

## Core Rule

Proceed without prompting when:
- the decision stays inside the current planning stack
- the decision is reversible
- the decision does not expand product scope
- the decision does not require new dependencies
- the decision does not contradict backend truth, visual truth, or the locked interaction model

Stop and ask when:
- the decision would change product scope
- the decision would change dependencies
- the decision would change architecture in a way that triggers `architecture-renegotiation-protocol.md`
- the backend/mobile truth and the current web plan no longer fit together cleanly
- the golden set is too ambiguous to choose a direction confidently

## What Can Be Decided Autonomously

The implementation may proceed without asking on:

- local refactors inside the current file and component boundaries
- extracting child components or view-model helpers when the split clearly improves ownership
- deleting or quarantining dead legacy code that is not part of the active reports workbench
- tightening shell, spacing, typography, and surface styling to better match the approved screens
- tightening route behavior so unsupported surfaces stay redirected
- tightening review harness behavior so scenarios and routes become more deterministic
- adding tests that protect the current planned behavior
- adding review evidence bundles
- renaming internal variables, local helpers, and local files when the new names better match the current plan
- replacing weak compatibility wrappers with cleaner feature-local code when the visible behavior stays aligned

## What Must Stay Narrow

Default to the narrowest correct move.

That means:
- prefer reports-only cleanup over preserving older full-dashboard scaffolding
- prefer local feature extraction over new global abstractions
- prefer deleting or isolating baggage over carrying it forward "just in case"
- prefer disabled or blocked UI over fake capability
- prefer truthful minimal UI over speculative utility chrome

## What Requires A Stop

Stop and ask before continuing if any of these happen:

- a new package seems necessary
- an existing package must be removed or upgraded to proceed
- the backend contract differs from the current frontend assumptions in a way the specs do not already explain
- the golden-set visuals and backend truth point in materially different directions
- the work would require reviving unsupported surfaces such as inventory, settings, auth, or onboarding
- the best implementation path would change the locked route model, client boundary, fixture strategy, or review model
- the cleanup would delete user-authored artifacts whose status is ambiguous
- the branch reveals a hidden dependency on old fixture/session runtime that cannot be cleanly isolated

## Decision Ladder

When several reasonable choices exist, choose in this order:

1. backend truth
2. mobile-led product family
3. approved web golden set
4. current reports-workbench planning docs
5. code clarity and testability
6. convenience

Convenience is allowed to break ties.
Convenience is not allowed to beat truth.

## Overnight Default Posture

For a long unattended run:

- keep moving through the current ticket chain unless a stop condition is hit
- choose the more conservative implementation when two choices both satisfy the plan
- do not pause for micro-decisions about naming, spacing, or local extraction if the planning docs already imply the answer
- do not open new sidequests
- do not re-open settled scope or architecture questions

## Allowed "Pass-With-Notes" Continuation

The run may continue after a `pass-with-notes` visual verdict if:
- the notes are about spacing, line wrapping, or minor polish
- the screen family is semantically correct
- the route and interaction model are correct
- the deviation does not imply unsupported product behavior

The run must not continue past a failed screen if:
- visible actions are wrong
- product nouns are wrong
- state visibility is wrong
- unsupported scope leaked back in
- the screen no longer belongs to the approved family

## Architecture Guardrail

If the best next move would violate a locked architecture decision, do not quietly "just do it."

Use `architecture-renegotiation-protocol.md`.

Autonomy is permission to proceed within the current architecture.
It is not permission to change the architecture silently.

## Dependency Guardrail

This envelope does not override the dependency rule.

If implementation touches:
- `packages/dashboard/package.json`
- `bun.lock`

stop unless explicit approval already exists for that exact dependency action.

## Success Condition

This autonomy envelope is working if an unattended run can:
- finish multiple tickets in sequence
- preserve backend truth
- preserve visual and semantic backpressure
- avoid prompting on small local choices
- stop only for real cross-cutting decisions
