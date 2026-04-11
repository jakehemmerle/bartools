# Brownfield Audit Report

## Date
2026-04-09

## Tech Stack
- Language(s): TypeScript (strict, ESNext target), JSX/TSX
- Framework(s):
  - Backend: Hono (lightweight web framework on Bun runtime)
  - Dashboard: React 19 + Vite 8 + Mantine 9 (component library) + React Router DOM 7
  - Mobile: Expo 54 + React Native 0.81
  - Eval: Claude Agent SDK + LangSmith (eval/tracing)
  - ORM: Drizzle ORM + drizzle-kit (backend schema management)
  - Validation: Zod (dashboard schemas + eval types)
- Package Manager: Bun (workspaces)
- Database: PostgreSQL 16 (via docker-compose, Alpine image)
- Infrastructure: Docker Compose (Postgres only); no Dockerfiles for app containers; no CI/CD pipeline detected

## Architecture
- Pattern: Bun workspaces monorepo (`packages/*`), 5 workspace packages
- Key directories:
  - `packages/backend/` — Hono API server (2 source files: index.ts entry + schema.ts with full Drizzle schema)
  - `packages/dashboard/` — Vite + React + Mantine web app (~25 source files). Substantially scaffolded with routing, pages, fixture data system, Zod schemas, CSV export, test utilities. Uses a "fixture session" pattern (localStorage-based persona switching) instead of real auth.
  - `packages/mobile/` — Expo React Native bare starter (App.tsx + index.ts). Imports `@bartools/ui`. Minimal scaffolding only.
  - `packages/eval/` — Claude Agent SDK eval harness for bottle identification. 8 source files + 5 test files. Integrates with LangSmith for experiment tracking. Well-structured with clear separation (types, bottles, evaluators, solutions, seed, run).
  - `packages/ui/` — Shared component library (greet.ts, Button.tsx, index.ts). React Native Pressable-based Button. Being deprecated in favor of dashboard-specific components.
  - `assets/` (repo root) — Eval assets: photos, CSV bottle list, solutions JSONL
  - `thoughts/shared/` — Research docs, plans, decisions (project management artifacts)
  - `docs/` — Context docs, deep research PDFs, memory bank
- Entry points:
  - Backend: `packages/backend/src/index.ts` (Bun server on port 3000, exports `{ port, fetch }`)
  - Dashboard: `packages/dashboard/src/main.tsx` (Vite entry, renders `<App />` into DOM)
  - Mobile: `packages/mobile/index.ts` (Expo entry via registerRootComponent)
  - Eval: `packages/eval/src/run.ts` (CLI entry, `bun run eval`) and `packages/eval/src/seed.ts` (`bun run seed`)

## Test Coverage
- Rating: Moderate
- Framework: Vitest (dashboard), Bun test runner (ui, eval)
- Test files: 16 total
  - Dashboard: 10 test files (router, 5 pages, 2 lib modules, 1 fixtures, 1 CSV export) — 323 LOC
  - Eval: 5 test files (ask-model, bottles, evaluators, seed, solutions) — 559 LOC
  - UI: 1 test file (greet.test.ts) — 6 LOC
  - Backend: 0 test files
  - Mobile: 0 test files
- Test/source ratio: 16 test files / 40 source files = 0.40; 998 test LOC / 3,637 source LOC = 0.27
- Test infrastructure: Dashboard has proper test setup (jsdom environment, localStorage/matchMedia/ResizeObserver mocks, custom `renderWithProviders` and `renderAppRoutes` test utilities). Well-configured vitest.config with React plugin.
- CI config: None detected (no `.github/workflows/`, no Jenkinsfile, no `.gitlab-ci.yml`)
- Gaps: Backend has zero tests despite having a substantial Drizzle schema (278 LOC). Mobile has zero tests.

## Dependency Health
- Total unique deps: 37 (17 production, 20 dev)
- Lock file: present (bun.lock)
- node_modules: NOT installed (missing from disk)
- Known vulnerabilities: 2 moderate
  - `esbuild <=0.24.2` — development server request forgery (GHSA-67mh-4wv8-2f99), pulled by drizzle-kit and vite
  - `@anthropic-ai/sdk >=0.79.0 <0.81.0` — Memory Tool sandbox escape (GHSA-5474-4w2j-mq4c), pulled by claude-agent-sdk
- Version currency: Dependencies are very recent (React 19.2, Vite 8, TypeScript 6, Mantine 9, Expo 54). This is a fresh project.
- Workspace dep: `@bartools/ui` linked via `workspace:*` in mobile. Dashboard does NOT depend on `@bartools/ui` (uses Mantine directly).
- Note: `@anthropic-ai/claude-agent-sdk` is declared in both root package.json (^0.2.97) and eval package.json (^0.2.98) — minor version mismatch, bun deduplication should handle this.

## Documentation State
- Rating: Moderate
- README: Good quality root README — covers workspace layout, prerequisites (Bun install), dependency install, test command, dev commands. Clear and actionable.
- Eval README: Good — explains setup, commands, labeling workflow, output artifacts, default model.
- Architecture docs: No dedicated ARCHITECTURE.md. Architecture is implicitly documented via README workspace diagram, CLAUDE.md build instructions, and `thoughts/shared/` research artifacts (PRD, domain map, requirements, problem statement, plan).
- Inline docs: Backend schema.ts has excellent inline documentation (entity-level comments explaining domain choices like flat spirit categories, fill level encoding, session lifecycle). Eval types.ts has good JSDoc. Dashboard code has minimal inline comments.
- .env.example: Present and well-documented with all required env vars.
- CLAUDE.md: Extensive project instructions for AI-assisted development (research-first rule, TDD, validation gates, session protocol, commands, skills).
- AGENTS.md: Minimal (just "read CLAUDE.md").
- Gaps: No API documentation, no CONTRIBUTING guide, no CHANGELOG.

## Key Observations

### Dashboard Fixture Architecture
The dashboard uses a sophisticated fixture-based development pattern instead of a real backend connection:
- `FixtureSessionProvider` manages auth personas (manager/staff/signed_out) via localStorage
- `lib/fixtures/schemas.ts` defines full Zod schemas for all domain objects (inventory, sessions, settings, members)
- `lib/fixtures/builders.ts` + `scenarios.ts` generate realistic test data
- Route guards use fixture personas for auth gating
- This is intentional scaffolding for UI-first development before backend API integration

### Backend-Dashboard Gap
The backend has only 2 routes (GET `/` and GET `/health`) but a fully modeled Drizzle schema (users, venues, venue_members, locations, bottles, sessions, scans, inventory with relations and indexes). The dashboard has its own Zod schema definitions that partially overlap with but don't directly mirror the backend schema. These will need reconciliation during API integration.

### Eval Package Maturity
The eval package is the most complete feature — it has a working Claude Agent SDK pipeline, LangSmith integration, proper test coverage (5 test files), seed/run workflow, and clear documentation. This suggests the bottle identification ML pipeline is further along than the web application.

## Recommendations
- [P0] **Add CI pipeline** — No CI/CD exists. At minimum, add a GitHub Actions workflow running `bun test` and `bun run --filter @bartools/dashboard lint` on PRs.
- [P0] **Install dependencies** — `node_modules` is missing from disk. Run `bun install` to restore.
- [P1] **Add backend tests** — The backend has 0 tests despite a 278-line Drizzle schema. Add schema validation tests and route handler tests before building out API endpoints.
- [P1] **Resolve dependency vulnerabilities** — Two moderate CVEs. Run `bun update` to pull patched versions of esbuild and @anthropic-ai/sdk.
- [P1] **Reconcile dashboard/backend schemas** — Dashboard Zod schemas (schemas.ts) and backend Drizzle schema (schema.ts) model the same domain differently. Plan a shared types package or code generation strategy before building API integration.
- [P2] **Clarify @bartools/ui deprecation** — README lists it as shared between dashboard and mobile, but dashboard doesn't import it. If it's being deprecated, update README and consider removing the workspace dependency or scoping it to mobile-only.
- [P2] **Add backend API routes** — Backend is a stub (2 routes). The Drizzle schema is ready for CRUD operations. Prioritize routes the dashboard needs (inventory, sessions, auth).
- [P2] **Deduplicate claude-agent-sdk version** — Minor version mismatch between root (^0.2.97) and eval (^0.2.98). Move to eval-only or align versions.
- [P3] **Add architecture documentation** — Domain model is well-documented in schema comments but there's no standalone architecture doc. Consider generating one from the existing Drizzle schema + dashboard route structure.
- [P3] **Add mobile test infrastructure** — Mobile package has zero tests and no test framework configured.
