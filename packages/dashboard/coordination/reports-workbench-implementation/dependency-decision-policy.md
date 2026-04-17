# Dependency Decision Policy

## Purpose

This document defines the dependency policy for the BARBACK reports workbench.

Its job is to make dependency-related stop conditions explicit so the implementation run does not pretend that package changes are "small refactors."

## Current Position

The preferred path is:

- use the dependencies already present in `@bartools/dashboard`
- avoid new dependencies
- avoid version churn during active implementation
- solve problems inside the current stack unless a dependency change is clearly unavoidable

## Current Approved Stack Direction

The current implementation direction assumes continued use of:

- React
- React Router
- `react-aria-components`
- Zod
- the current testing stack
- the current Storybook stack for limited primitive/composite coverage

It also assumes continued avoidance of:

- Mantine reintroduction
- a new visible design-system dependency
- a new state-management library unless explicitly approved
- any runtime dependency that re-broadens the app into a different architectural shape

## Default Rule

Without explicit approval, the implementation should treat all dependency changes as disallowed.

That includes:
- adding a package
- removing a package
- upgrading a package
- downgrading a package
- replacing one package with another

## Allowed Without Dependency Changes

The implementation should prefer:

- local CSS over a styling package
- local helpers over a utility package
- feature-local state over a new store library
- existing React Aria primitives over introducing an alternative control library
- existing test tooling over new test helpers

## Stop-And-Ask Categories

Stop before continuing if a change would touch:

- `packages/dashboard/package.json`
- `bun.lock`

Especially stop if the change would:

- add a UI library
- add a state-management library
- add a browser automation or screenshot dependency
- add a data-fetching library
- add a form library
- replace `react-aria-components`
- reintroduce Mantine or a comparable framework dependency
- alter Storybook or test-runner dependencies

## Strong Negative Defaults

Assume `no` by default on:

- Zustand
- Redux
- TanStack Query
- Tailwind
- component generator frameworks
- animation libraries
- CSS-in-JS libraries

Those are not banned forever.
They are just not the default answer for this build.

## Removal Policy

Even dependency removals should be treated carefully.

Removal may be desirable, but still requires explicit approval because it modifies the dependency graph and lockfile.

Do not silently remove a package just because it appears unused.

## Upgrade Policy

Do not opportunistically upgrade packages during implementation work.

If a version bump seems helpful but not necessary, defer it.

If a version bump seems necessary to unblock a real implementation problem, stop and ask.

## Emergency Exception

If implementation becomes impossible without a dependency change, do not improvise around the rule.

Instead, surface:
- what package change is needed
- why the current stack is insufficient
- what files would be affected
- whether there is a weaker alternative inside the current stack

## Success Condition

This policy is working if the implementation can get deep into the backlog using the current stack, and dependency changes appear only as genuine blockers rather than as convenience moves.
