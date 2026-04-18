# Code Quality Gates

This document defines the code-quality backpressure for the BARTOOLS dashboard.

It exists to prevent a familiar failure mode:

the repo starts looking "organized" because it has more files, more stories, more tests, and more abstractions, while the actual code gets harder to reason about.

This is the anti-slop document.

## Purpose

These gates should:
- keep the React + TypeScript codebase readable as it grows
- prevent fake reuse and abstraction theater
- keep Storybook and tests useful instead of ceremonial
- make architectural drift more expensive than conscious design

These gates should not:
- reward codebase fragmentation for its own sake
- force every one-off route fragment into a shared component
- turn the repo into a component-library demo
- create low-signal testing sludge

## Core Position

The quality bar is not:
- smaller files
- more components
- more stories
- more tests

The quality bar is:
- clearer boundaries
- less duplicated decision logic
- stronger type truth
- easier review
- less accidental drift

Artifact count is not quality.
Clarity is quality.

## The Main Slop Risks

### 1. File-Splitting Theater

Symptoms:
- a large file gets split into `helpers.ts`, `utils.ts`, and `constants.ts`
- the original complexity survives, just distributed across more files
- files become harder to navigate without becoming more coherent

Counter-pressure:
- extracted files must have a clear job and a domain name
- extraction should reduce conceptual load, not just line count
- do not move code into generic buckets to satisfy the cap

### 2. Premature Component Library Drift

Symptoms:
- one-off route fragments become "shared components"
- local product decisions are abstracted before a second real use exists
- component APIs become broader than the product actually needs

Counter-pressure:
- first use stays local
- second real use can justify extraction
- shared components need real consumers, not imagined future reuse

### 3. Storybook As A Parallel Fake App

Symptoms:
- Storybook becomes a second source of truth for full screens
- stories are written for every leaf component regardless of value
- the review harness and Storybook start drifting apart

Counter-pressure:
- Storybook is for reusable primitives and stable composites
- review routes remain the source of truth for full-screen state families
- do not create storybook-only components

### 4. Test Sludge

Symptoms:
- snapshot churn
- shallow render tests with no behavioral protection
- coverage-driven filler tests
- "renders without crashing" style assertions

Counter-pressure:
- test behavior, not incidental markup
- every bug fix adds a regression test
- coverage is diagnostic, not a quality substitute

### 5. Type Erosion

Symptoms:
- `any`
- `@ts-ignore`
- double-casts
- casual non-null assertions
- view code inventing local shapes that drift from shared contracts

Counter-pressure:
- shared/backend types remain the source of truth where they exist
- escape hatches are exceptional and documented
- type uncertainty should stay visible instead of being erased

## Gate 1: File Size

### Hard Cap

Production source files in `packages/dashboard/src/` should not exceed `500` lines.

This cap applies to:
- `.ts`
- `.tsx`
- `.css`

Authored test files, story files, and fixture files should target the same `500`-line cap.

If a non-production authored file exceeds the cap, it should still be treated as suspicious and split unless:
- the bulk is simple scenario data or evidence data
- splitting would make the file harder to review than keeping it whole
- the exception is called out explicitly in review

If a file exceeds `500` lines, it must be split into:
- child components
- view-model helpers
- domain helpers
- smaller style modules

It must not be split into:
- `utils.ts`
- `helpers.ts`
- `common.ts`
- `shared.ts`
- `misc.ts`

### Implementation Rule

A split is only acceptable if the resulting files have clearer ownership than the original file.

Good:
- `report-review-action-bar.tsx`
- `fill-tenths-control.tsx`
- `report-comparison-view.ts`

Bad:
- `report-detail-utils.ts`
- `report-detail-helpers.ts`
- `report-detail-misc.ts`

### Review Rule

If a reviewer cannot explain the distinct job of the new file in one sentence, the split probably failed.

## Gate 2: Function And Component Complexity

### Preferred Limits

- component body: aim for `<= 100` lines
- helper function body: aim for `<= 80` lines
- cognitive/cyclomatic complexity: aim for `<= 10`
- parameter count: aim for `<= 5`
- nesting depth: aim for `<= 3`

These are not purity games.
They exist because large render functions and deeply branched helpers become review-hostile fast.

### Split Triggers

Split or redesign when:
- one component renders multiple distinct state families
- one function both derives data and renders UI decisions
- one function needs comments to explain its branching shape
- a component requires more than a screenful to understand where actions live

## Gate 3: Module Boundaries

The dashboard should preserve a readable import shape.

### Allowed Direction

```text
app -> shell/primitives/features/lib
shell -> primitives
features/routes -> features/components -> primitives/lib
features/view-models -> lib
lib -> shared/backend types
```

### Not Allowed By Default

- cross-feature imports
- cyclic imports
- routes importing from unrelated route files
- primitives importing feature-specific code
- lib modules importing rendered UI

### Boundary Rule

If a change requires a boundary exception, write it down in the same change set.
Do not let convenience silently rewrite the architecture.

## Gate 4: Component Extraction Discipline

### First-Use Rule

A one-off route fragment should usually stay local to its feature file or feature folder.

Do not extract on first use just because:
- it looks "cleaner"
- it might be reusable later
- we want to hit the file cap by moving code elsewhere

### Second-Use Rule

A shared primitive or stable composite should normally require:
- at least `2` real consumers
- a clear API contract
- no feature-specific nouns leaking into its props

### API Smell Rules

Treat these as redesign signals:
- more than `2` boolean variant props
- prop names like `isSpecial`, `isAlt`, `compact`, `dense`, `minimal`, `muted` piling up together
- components that accept both data derivation inputs and display overrides

### Local Definition Rule

Do not define child components inside render bodies unless there is a very narrow reason.

Why:
- unstable component identity
- harder testability
- harder reading
- easy path to accidental closure coupling

## Gate 5: Naming Hygiene

### Ban Generic Graveyard Filenames

Do not introduce files named:
- `utils.ts`
- `helpers.ts`
- `common.ts`
- `shared.ts`
- `misc.ts`
- `temp.ts`
- `stuff.ts`

Use domain names instead.

Good:
- `report-list-view.ts`
- `review-scenarios.ts`
- `semantic-colors.ts`

Bad:
- `report-utils.ts`
- `general-helpers.ts`
- `shared-components.tsx`

### Barrel Rule

Avoid broad barrel files that flatten boundaries and make imports less honest.

Barrels are acceptable only when:
- the directory is already a stable public boundary
- re-exporting improves clarity more than it hides ownership

## Gate 6: TypeScript Discipline

### Default Position

TypeScript is part of the quality system, not an annoying preflight.

### Not Allowed By Default

- raw `any`
- `@ts-ignore`
- `as unknown as`
- non-null assertions used as routine flow control

### Allowed Only With Friction

- `unknown` when the uncertainty is real
- `@ts-expect-error` only with a brief reason
- narrow casts after validation or parsing

### Shared-Type Rule

If shared/backend types already exist, do not create dashboard-local duplicates that drift from them.

Local helper types are acceptable when they are:
- clearly view-model types
- downstream projections of shared truth
- named to show that they are UI-specific

## Gate 7: Styling Discipline

### Token Rule

Do not introduce raw colors, spacing values, or typography values where a locked token or role already exists.

### Inline Style Rule

Inline style should be rare.

Allowed examples:
- truly dynamic geometry
- runtime width/height calculations
- per-instance CSS custom property injection

Not allowed examples:
- normal spacing
- normal colors
- ad hoc layout patches

### Repetition Rule

When the same styling pattern appears a second time, consider graduating it into:
- a primitive
- a stable feature component
- a named style pattern

Do not wait for the fifth copy-paste before admitting repetition.

## Gate 8: Storybook Scope

Storybook is useful here, but only if it stays narrow and honest.

### Storybook Is For

- reusable primitives
- stable shared composites
- interactive states worth isolating
- long-content, empty, disabled, and missing-media component states

### Storybook Is Not For

- full route families
- review-harness replacement
- backend-truth workflow review
- every tiny leaf component by default

### Required Story Candidates

Once Storybook is added, prioritize stories for:
- `Button`
- `StatusChip`
- `SurfaceCard`
- `Select`
- `AppWordmark`
- stable reusable record/list cards once they are truly shared

### Story Discipline

Each story should exist because it teaches something:
- default behavior
- error or disabled state
- long-content resilience
- missing-media resilience
- visual contract

If a story teaches nothing, it is probably repo plaque.

### Initial Storybook Fence

The initial automated Storybook scope is intentionally narrow:
- `src/components/primitives/**/*.stories.tsx`

Anything outside that fence should fail review and fail enforcement until we consciously widen the allowed scope.

## Gate 9: Testing Discipline

### Testing Layers

Use the smallest test that protects the behavior:
- pure logic -> unit test
- route/state orchestration -> integration test
- visual family/state coverage -> review routes and evidence bundle

### Required Rules

- every bug fix adds a regression test when feasible
- every exported reusable primitive gets at least one meaningful behavior or accessibility test
- route families should have integration tests for their state/interaction truth
- shared derivation logic should be tested outside rendered routes

### Not Recommended

- snapshot-heavy testing
- coverage quotas as the main quality bar
- duplicating the same assertion shape across many fixtures just for volume

### Coverage Position

Coverage may be tracked, but it is not a primary gate.

Why:
- teams game it
- low-signal tests inflate it
- a repo can have high coverage and terrible architecture

Behavioral confidence beats percentage vanity.

## Gate 10: Review And Dependency Friction

### Required In Review

Each meaningful frontend PR or checkpoint should answer:
- what abstraction was introduced
- what abstraction was deleted
- what boundary changed
- what tests were added or updated
- what visual or semantic evidence was updated

### Dependency Rule

No new frontend dependency without a short written justification covering:
- what problem it solves
- why local code is not enough
- what architectural gravity it introduces
- whether it overlaps with an existing dependency

Convenience dependencies are a common slop vector.

Dependency installs should be treated as a red-flag moment, not a silent implementation detail.

## What We Will Not Do

To avoid fake rigor, we explicitly reject these habits:

- mandatory story for every component
- mandatory unit test for every file
- snapshot quotas
- coverage quotas as merge gates
- extraction on first use "for reuse later"
- giant shared utility buckets
- page generators that stamp out boilerplate abstractions

## Enforcement Sequence

### Immediate

Use this document as a review policy now.

Reviewers should begin enforcing:
- the `500`-line file cap
- naming hygiene
- TypeScript escape-hatch friction
- anti-sludge testing discipline

### Wired Now

The dashboard now enforces these automatically in lint/tooling:
- file-length checks
- complexity checks
- import-cycle checks
- import-boundary checks for key layers
- story-placement checks
- banned filename and banned TypeScript-escape patterns where practical

### Human Review Still Required

Tooling does not replace judgment.

Review still needs to catch:
- fake abstractions that technically pass the line cap
- stories that add noise instead of signal
- dependencies whose architectural gravity outweighs their convenience
- boundary changes that need a conscious architecture note

### Storybook Rollout

Add Storybook with a deliberately narrow initial scope:
- primitives first
- then truly shared stable composites
- never as a substitute for the review harness

Use the repo PR template at `.github/pull_request_template.md` as the default checkpoint checklist when dashboard code is involved.

## Merge Standard

A frontend change is not code-quality clean just because:
- it compiles
- it passes tests
- it is under `500` lines per file

A frontend change is code-quality clean when:
- the file structure is coherent
- abstractions are honest
- types still tell the truth
- tests protect real behavior
- Storybook scope, if involved, stayed narrow
- the change reduced or contained drift rather than redistributing it
