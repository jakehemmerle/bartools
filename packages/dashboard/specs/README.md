# Dashboard Specs

This folder contains the review-first MVP specs for the web dashboard.

## Goal

Align on what we are building before implementation starts.

## Ownership Boundary

These documents define dashboard product scope, UX behavior, visual system decisions, and dashboard-facing data requirements.

They do not define:

- Backend storage implementation
- Media retention policy
- Training pipelines or model operations
- Internal backend routing or service boundaries

When a backend capability matters to the dashboard, the spec should describe the dependency from the dashboard's point of view rather than prescribing backend architecture.

## Technical Notes

- Prefer TanStack Query for dashboard server state once real data fetching is introduced
- Do not adopt Zustand by default for MVP
- Use local React state first for simple UI state, and add a client state library only if real cross-page state needs emerge
- During dashboard MVP, `packages/dashboard` should not import rendered UI components from `@bartools/ui`
- Treat `packages/ui` as mobile-oriented for rendered components until the team makes a deliberate cross-platform UI decision

## MVP Surfaces

- Public landing page with sign in and sign up entry points
- Authenticated dashboard for inventory operations
- Export of inventory data to CSV
- A dashboard-specific component and styling system built on Mantine

## Document Map

- `mvp-overview.md` — product scope, user journeys, and success criteria
- `styling-and-component-system.md` — visual system decisions and component usage rules
- `landing-and-auth.md` — public marketing surface and authentication flows
- `inventory.md` — inventory table and default signed-in view
- `low-stock.md` — reorder queue / low-stock workflow
- `sessions.md` — session history and session detail
- `settings.md` — bar settings and product-level PAR overrides
- `csv-export.md` — export behaviors and constraints
- `data-contracts.md` — proposed dashboard-facing data shapes and endpoints
- `open-questions.md` — parking lot for any new decisions that emerge during review

## Coordination Docs

Execution-facing planning now lives in [packages/dashboard/coordination/README.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/coordination/README.md).

That directory contains:

- phased implementation planning
- fixture and testing strategy
- execution backlog
- ticket-sized work slices

## Review Guidance

Reviewers should focus on:

- Whether the MVP scope is correct
- Whether the visual system feels intentional and distinct from generic SaaS defaults
- Whether any required page states or user actions are missing
- Whether the proposed data model supports the UI
- Whether anything should move in or out of MVP

Implementation should not start until the open questions are resolved or intentionally deferred.
