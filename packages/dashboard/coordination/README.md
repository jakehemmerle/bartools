# Dashboard Coordination

This folder contains execution-facing planning for the dashboard MVP.

The product source of truth remains the spec set in [packages/dashboard/specs/README.md](/Users/patrick/Code/gauntlet/capstone/bartools/main_repo/bartools/packages/dashboard/specs/README.md).

Use this directory for:

- implementation sequencing
- execution slicing
- fixture strategy
- testing strategy
- ticket preparation

## Document Map

- `implementation-plan.md` — phased implementation roadmap, review checkpoints, and introspection workflow
- `phase-0-1-breakdown.md` — concrete task breakdown for foundation reset and fixture-based review harness
- `phase-2-4-breakdown.md` — concrete task breakdown for app shell, auth/onboarding, and settings/access
- `phase-5-10-breakdown.md` — concrete task breakdown for operational views, export, integration, and final polish
- `execution-backlog.md` — execution-ready work slices derived from the implementation phases
- `ticket-backlog.md` — ticket-sized implementation backlog derived from the phase plan and execution backlog
- `fixture-schema-strategy.md` — fixture and scenario validation strategy, including planned Zod usage
- `testing-strategy.md` — testing layers, recommended tooling, and minimum test bar by implementation phase
- `readiness.md` — implementation readiness gate and current go/no-go assessment
- `stitch_handoff_selection.md` — canonical mockup winners, locked design decisions, and mockup defects to correct or ignore
- `stitch_prompt_v4_3_handoff.md` — constrained Stitch prompt for a final handoff-oriented cleanup pass

## Working Agreement

- Keep product truth in `specs`
- Keep execution truth in `coordination`
- If a coordination doc and a spec disagree on product behavior, fix the coordination doc to match the spec
