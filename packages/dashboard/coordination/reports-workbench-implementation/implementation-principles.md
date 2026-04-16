# Implementation Principles

## Source Of Truth Order

When implementation decisions conflict, use this order:

1. Backend contracts and workflow semantics
2. Mobile visual language and product family
3. Approved web golden-set mockups
4. Existing dashboard code
5. UI library defaults

If a React Aria example or convenience pattern conflicts with the approved product shape, the approved product shape wins.

## Product Scope

The real web product being built right now includes:
- entry surface
- reports list
- reports empty state
- report detail
- report detail state variants
- blocked state
- not found state

The real web product being built right now does not include:
- inventory workflows
- low stock workflows
- settings
- team management
- signup or sign-in as real backend-backed flows
- venue bootstrap
- analytics
- export center

Routes that currently redirect unsupported surfaces to `/reports` should stay functionally narrow until backend scope changes.

## Fidelity Rules

The implementation should not treat the mockups as vague inspiration.

It should preserve, as closely as practical:
- screen hierarchy
- shell structure
- page density
- copy tone
- action restraint
- original-versus-corrected visual hierarchy
- failed-record presentation tone
- dark-first composition

It should not preserve by force:
- exact pixel values if responsive adjustments are needed
- generated placeholder image assets
- obviously fake or unsupported copy
- HTML comment terminology like `fillPercent`

## Current Gap To Close

Today the reports pages exist, but they are still generic product scaffolding:
- table-first list presentation
- card-and-badge detail presentation
- generic state panels
- library-default feel

The target is not "same data, prettier cards."

The target is:
- a report workbench that reads like the approved BARBACK desktop product
- deterministic screen states matching the golden set
- a code structure that allows future backend wiring without redesign

## UI Stack Rules

Use:
- React
- React Router
- `react-aria-components` where accessible interaction primitives help
- dashboard-local CSS and component styling

Do not use:
- Mantine as the visual or structural layer
- a third-party shell/layout system as page identity
- generic component-library aesthetics as a shortcut

## Language Rules

Allowed product language:
- report
- record
- bottle
- product match
- fill level
- original model output
- final corrected values
- blocked
- not found

Forbidden drift:
- session
- inventory report
- capture ID
- batch
- discrepancy
- variance
- operator console
- control center
- command center

## Review Interaction Rules

The frontend review model should reflect backend truth:
- review is report-level
- records collect decisions
- each decision includes `id`, `bottleId`, and `fillTenths`

UI consequences:
- no per-record submit buttons
- one final review submission action per reviewable report
- fill-level controls display discrete tenths `0` through `10`
- visible UI should not expose decimals like `4.2`
- visible UI should not use percentage labels for the review control itself

## Design System Rules

The web app should feel like BARBACK, not like a component library demo.

That means:
- define dashboard-local tokens
- own the shell, surface, spacing, and typography rules locally
- use React Aria for behavior and accessibility, not for aesthetic direction
- move repeated product styling into local components
- avoid shipping pages that still look like assembled examples

## Scaffolding Rules

Before feature completeness, the app must be able to render stable design states from fixtures.

That means:
- deterministic fixture-driven review routes
- stable report-state fixtures
- stable record-state fixtures
- reusable shell and screen components

The scaffolding is successful when a developer can open a route and compare it directly to a golden-set screen without requiring backend setup.

## Backpressure Checklist

Every major implementation pass should be checked against these questions:

1. Does this screen still look like BARBACK, or did it regress into a library demo?
2. Does this interaction imply backend capabilities we do not have?
3. Did any old full-dashboard scope leak back in?
4. Are we preserving the calm operational tone?
5. Are we accidentally using generic copy where the approved screen is more specific?
6. Are we introducing one-off styling instead of reusable product primitives?
7. Is the route/state naming still aligned with backend language?
8. Did we accidentally let a headless primitive dictate layout or visual structure?
