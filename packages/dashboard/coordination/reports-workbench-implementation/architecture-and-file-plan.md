# Architecture And File Plan

## Current Starting Point

Relevant current files:

- `src/app/router.tsx`
- `src/app/providers.tsx`
- `src/app/theme.ts`
- `src/components/layout/public-shell.tsx`
- `src/components/layout/authenticated-shell.tsx`
- `src/components/states/state-panel.tsx`
- `src/pages/reports-page.tsx`
- `src/lib/reports/client.ts`
- `src/lib/reports/provider.tsx`
- `src/lib/reports/review-draft.ts`
- `src/lib/reports/stream.ts`

The main issue is not absence of functionality.
It is that the current implementation shape is too page-local and too generic to faithfully express the approved product.

## Proposed Top-Level Structure

```text
packages/dashboard/src/
  app/
    router.tsx
    providers.tsx
    theme/
      tokens.ts
      typography.ts
      semantic-colors.ts
  components/
    shell/
      public/
        public-shell.tsx
        public-top-bar.tsx
      workbench/
        workbench-shell.tsx
        workbench-top-bar.tsx
        workbench-canvas.tsx
    primitives/
      app-wordmark.tsx
      status-chip.tsx
      section-eyebrow.tsx
      surface-card.tsx
      button.tsx
      select.tsx
  features/
    reports/
      components/
        entry-screen.tsx
        reports-list-screen.tsx
        reports-empty-screen.tsx
        reports-list-header.tsx
        reports-list-container.tsx
        reports-list-row.tsx
        report-detail-screen.tsx
        report-header.tsx
        report-metadata-bar.tsx
        report-progress-panel.tsx
        report-record-list.tsx
        report-record-card.tsx
        report-record-media.tsx
        report-record-summary.tsx
        report-record-error-panel.tsx
        report-review-controls.tsx
        bottle-match-control.tsx
        fill-tenths-control.tsx
        report-review-action-bar.tsx
        report-comparison-panel.tsx
        report-blocked-screen.tsx
        report-not-found-screen.tsx
      routes/
        entry-route.tsx
        reports-route.tsx
        report-detail-route.tsx
        review-entry-route.tsx
        review-reports-list-route.tsx
        review-reports-empty-route.tsx
        review-report-created-route.tsx
        review-report-processing-route.tsx
        review-report-unreviewed-route.tsx
        review-report-reviewed-route.tsx
        review-report-comparison-route.tsx
        review-report-failed-route.tsx
        review-report-blocked-route.tsx
        review-report-not-found-route.tsx
      fixtures/
        review-scenarios.ts
      view-models/
        report-detail-view.ts
        report-list-view.ts
        report-comparison-view.ts
  lib/
    reports/
      client.ts
      provider.tsx
      review-draft.ts
      stream.ts
```

This structure is now the canonical planning target.
Minor helper filenames may move later, but the plan must preserve the separation between:
- app shell
- reusable product primitives
- reports feature components
- reports data/view-model logic
- review harness fixtures

## Canonical Naming Rules

To reduce implementation drift, use these naming rules consistently:

- screen-level rendered surfaces use `*-screen.tsx`
- route wrappers use `*-route.tsx`
- shell files live under `src/components/shell/`
- theme files live under `src/app/theme/`
- review fixtures live under `src/features/reports/fixtures/`
- feature view-model helpers live under `src/features/reports/view-models/`

Do not mix `*-page.tsx`, `*-screen.tsx`, and legacy layout paths in the planning set.
For this implementation track, `*-screen.tsx` is the canonical choice.

## Shell Plan

### Public Shell

Owns:
- entry-page layout
- public top bar
- public page width and spacing

Should not own:
- reports feature logic

### Workbench Shell

Owns:
- authenticated app frame
- top bar and page gutters
- desktop page width behavior

Should not own:
- report-specific record rendering
- blocked/not-found detail content

## Primitive Component Plan

We should introduce small BARBACK-flavored primitives to prevent style drift:

- `StatusChip`
  Shared status rendering for report and record states.

- `SectionEyebrow`
  Small uppercase label used across comparison and metadata sections.

- `AppWordmark`
  Consistent BARBACK header identity.

- `SurfaceCard`
  Shared surface wrapper for panels/cards if repetition appears.

These primitives are useful because the approved mockups repeat a specific tone that headless interaction primitives will not preserve by accident.

## Reports Feature Component Plan

### Reports List

Split into:
- list page container
- list rows
- empty-state variant

Reason:
- the list must support both real route rendering and review harness rendering

### Report Detail

Split into:
- page container
- header
- state-specific panels
- record card
- record media
- review controls
- comparison presentation

Reason:
- created/processing/unreviewed/reviewed/failed/comparison/blocked/not-found are one page family with different content states

## View-Model Plan

The UI should not derive everything inline inside route components.

Introduce view-model helpers that translate raw shared types into screen-ready structures:
- report header metadata
- list row content
- comparison panel sections
- review-control initial state
- record media fallback state

This gives us:
- cleaner components
- easier tests
- lower risk of semantic drift

## Fixture And Review Harness Plan

Keep the client boundary as-is conceptually:
- fixture-backed client now
- real backend client later

Add a review harness layer that can:
- choose a golden-set screen scenario explicitly
- inject fixture detail/list states without changing app semantics

This should be separate from the production route logic.

## Styling Strategy

Use React Aria for:
- accessibility behavior
- keyboard semantics
- form and popup primitives where useful

Do not rely on React Aria for:
- page identity
- visual hierarchy
- layout decisions
- design tokens

Implementation bias:
- use CSS modules or local CSS classes where the mockup structure needs precise composition
- keep design tokens centralized
- keep interaction behavior and visual styling clearly separated
- avoid ad hoc inline style sprawl

## Provider Plan

`src/app/providers.tsx` should become lighter after Mantine removal.

Expected responsibilities:
- reports client provider
- future app-wide React Aria related providers only if genuinely needed

It should not become:
- a replacement global styling framework
- a catch-all registry for every primitive package

## Test Placement

### Route Tests

Keep route tests near `src/app/`.

### Feature Component Tests

Place near `src/features/reports/components/`.

### View-Model Tests

Place near `src/features/reports/view-models/`.

### Client/Fixture Tests

Keep near `src/lib/reports/` and `src/features/reports/fixtures/`.

## Non-Goals For Architecture

Do not:
- build a generic plugin architecture
- over-abstract all status states into a meta-renderer
- generalize for future inventory/settings/features now
- move rendered web UI back into `packages/ui`

The architecture should be boring, explicit, and optimized for shipping the approved reports workbench well.
