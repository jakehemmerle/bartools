# Handoff — Research Session

**Date:** 2026-04-10
**Phase:** Plan locked → ready for implementation (M1)
**Branch:** main

---

## What Happened

Interactive research dialogue covering problem definition, VLM selection, backend architecture, mobile UX, data model, real-world bar data analysis, and team coordination. Scope locked after incorporating team contributions (Jacob's schema rewrite + eval harness, Patrick's dashboard specs, Verbena bar data).

## Key Artifacts

| File | What |
|---|---|
| `thoughts/shared/research/requirements.md` | **Locked scope** — MVP features, stretch, exclusions, tech decisions |
| `thoughts/shared/research/presearch_criteria.md` | 16-criteria coverage tracker (13/16 answered) |
| `thoughts/shared/research/problem-statement.md` | 1-paragraph problem + capture tiers + Verbena validation |
| `thoughts/shared/research/domain-map.md` | Users, workflow, data entities, dependencies, system boundary |
| `packages/backend/src/schema.ts` | Production Drizzle schema (venues, locations, sessions, scans, inventory) |
| `packages/eval/` | Bottle-ID eval harness (Claude Agent SDK + LangSmith) |
| `packages/dashboard/specs/` | Dashboard specs and data contracts |
| `assets/verbena_*` | Real bar data — spreadsheet, schema analysis, CSV, labeled photos |
| `docs/deep-research-report-bottles-api.md` | Bottle catalog data sources and GTIN strategy |
| `thoughts/trace/trace.jsonl` | Full research dialogue trace |

## Decisions Made
- **VLM:** Claude Sonnet 4.6 via Agent SDK (leverages CC subscription). Gemini fallback.
- **Backend:** Hono + Bun + PostgreSQL 16 + Drizzle ORM
- **Mobile:** Expo + Expo Router, tab navigation, batch capture with SSE progressive results
- **Dashboard:** Vite + React + Mantine
- **Fill level:** Integer 0-10 tenths. VLM coarse estimate, user refines.
- **Reorder:** PAR-based thresholds, configurable per product + venue default
- **Bottle catalog:** Global shared table, GTIN-12/UPC as canonical key
- **Categories:** Expanded beyond spirits — includes beer, wine, bitters, syrups, mixers, garnishes

## Open Items
- Image storage provider (S3/R2)
- Production hosting
- Production error handling
- CI/CD
- Security review

## Next Step
Plan locked. Start implementation with M1 (Mobile Foundation) — convert Expo starter to Expo Router with tab navigation and shared types.

## Team State
- **Ray:** Ready to scaffold mobile app
- **Jacob:** Backend schema done, eval harness operational, 9 photos labeled
- **Patrick:** Dashboard specs authored, implementation plan drafted, fixture-driven dev underway
