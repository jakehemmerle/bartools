# Reports Workbench Implementation

This folder is the execution-facing plan for turning the approved golden-set mockups into the real BARBACK web frontend.

This plan is intentionally narrower than the older dashboard-wide planning docs.

It assumes:
- the backend is the source of truth for functionality
- the mobile app is the source of truth for design language
- the approved web visual source is `packages/dashboard/coordination/golden-set-approved/`
- the current web product is a reports-first workbench, not a full dashboard
- React Aria is the interaction primitive layer
- BARBACK-owned components and styles, not a third-party design system, define the visible product language

## Goal

Make it possible to build the web frontend in a way that is:
- faithful to the approved mockups
- faithful to backend nouns and workflows
- explicit about what is scaffold work versus shipped product behavior
- detailed enough that implementation can proceed with very little re-planning

## Document Map

- `implementation-principles.md`
  Design fidelity rules, backend-truth rules, and anti-drift constraints.

- `screen-inventory.md`
  Route-by-route and screen-by-screen breakdown of what must exist in the app.

- `architecture-and-file-plan.md`
  Proposed code organization, component boundaries, state boundaries, and test placement.

- `component-map.md`
  Screen-to-component breakdown for the real app and review harness.

- `visual-token-spec.md`
  The locked visual contract: color roles, typography, spacing, radii, shadows, and layout invariants.

- `state-visibility-matrix.md`
  Exact rules for which UI appears in each route, report state, and record state.

- `screen-composition-spec.md`
  Screen-by-screen blueprint for block order, responsive behavior, and locked copy.

- `review-evidence-protocol.md`
  The required proof bundle for visual review, semantic review, and per-pass verification.

- `architecture-renegotiation-protocol.md`
  The process for consciously changing architecture instead of drifting into it.

- `execution-plan.md`
  Ordered implementation phases from scaffold to polished reports workbench.

- `scaffolding-backlog.md`
  Concrete file creation and modification checklist for the first implementation passes.

- `phase-1-2-file-checklist.md`
  Exact file-by-file checklist for the first coding passes: theme, shells, review harness, and screen extraction.

- `backpressure-and-review-gates.md`
  Explicit drift checks and pass/fail gates that every implementation phase should satisfy.

- `decisions/README.md`
  Decision-log rules and template for any conscious architecture renegotiation.

## Relationship To Other Coordination Docs

- `packages/dashboard/coordination/golden-set-approved/`
  This is the visual reference bundle.

- `packages/dashboard/coordination/stitch_handoff_selection.md`
  This explains which design choices are locked.

- Older coordination docs remain useful for history, but this folder is the planning source of truth for the current reports-workbench build.

## Technology Direction

For this implementation track:
- keep React Router
- keep the current reports client/provider boundary
- move away from Mantine
- use `react-aria-components` for accessible interaction primitives
- use dashboard-local CSS and components for the visible design language

Older coordination/spec docs that still mention Mantine should be treated as historical unless they are updated to match this folder.
