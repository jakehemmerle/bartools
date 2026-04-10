# Fixture Schema Strategy

## Purpose

Define how fixtures should be structured and validated so they support a reliable UI review and feedback loop during dashboard implementation.

## Why This Matters

Fixtures are not only a development convenience in this project. They are the basis of the introspection loop while backend contracts are still fluid.

That means fixtures need to be:

- stable
- readable
- reusable
- intentionally scenario-driven
- validated so they do not silently drift away from the dashboard contracts

## Recommendation

Use Zod schemas for fixture validation once implementation begins.

## Why Zod Is A Good Fit

- It gives the team a single source of truth for fixture shape validation
- It makes broken fixtures fail loudly instead of producing misleading UI states
- It can later support real API parsing if the team wants shared validation between fixtures and live data
- It helps the agent trust fixture scenarios while reviewing the UI

## What Should Be Validated

At minimum, define schemas for:

- user fixture data
- bar settings fixture data
- product PAR override fixture data
- inventory product rows
- low-stock rows
- session list items
- session detail records
- invite-link and permission-related fixture states

## Suggested Schema Layers

### 1. Base Entity Schemas

Examples:

- user
- bar settings
- inventory product row
- session bottle record

Purpose:

- validate raw fixture shapes

### 2. Scenario Schemas

Examples:

- manager inventory scenario
- non-manager settings scenario
- stale inventory scenario
- missing-media session scenario

Purpose:

- validate composed review states, not just individual entities

### 3. Fixture Builders

Examples:

- `makeManagerUser()`
- `makeInventoryRow()`
- `makeStaleInventoryScenario()`

Purpose:

- reduce repeated handwritten fixture objects
- make scenario generation readable

## Suggested File Organization

Likely dashboard-local structure:

```text
packages/dashboard/src/lib/fixtures/
  schemas/
  builders/
  scenarios/
```

This is a planning suggestion, not a committed implementation decision.

## How This Improves Feedback

For human review:

- scenarios are easier to name and reason about
- broken fixtures are easier to diagnose

For agent review:

- fixture states become more trustworthy
- visual feedback is less likely to be based on malformed or inconsistent data
- scenario names can map cleanly to requested reviews

## Recommended Initial Scenarios

- manager inventory default
- non-manager settings restricted
- settings member list
- settings manager-grant flow
- empty inventory
- stale inventory
- below-par inventory
- session detail with image
- session detail missing image
- onboarding create flow
- onboarding join flow

## Relationship To Backend Contracts

Fixtures should align with the dashboard-facing contracts in [data-contracts.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/data-contracts.md), but should not block on backend readiness.

The point is:

- start with validated dashboard-facing fixture shapes
- integrate live backend data later
- keep the fixture review loop useful even while backend APIs are changing

## Recommended Working Agreement

When implementation begins:

1. Add Zod as a dashboard dependency
2. Create base fixture schemas first
3. Create scenario schemas second
4. Build fixture builders on top of those schemas
5. Use validated scenarios for localhost review routes

## Anti-Patterns To Avoid

- Handwritten one-off fixture objects scattered across page files
- Scenario names without stable meaning
- Fixtures that include fields not grounded in the approved dashboard contracts
- Unvalidated mock objects that silently drift over time

## Definition Of Success

The fixture system is successful if:

- reviewers can rely on scenario names
- fixtures stay aligned with dashboard contracts
- the team can add new review states without chaos
- the agent can inspect localhost routes with confidence that the underlying scenario data is structurally valid
