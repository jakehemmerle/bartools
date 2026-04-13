# Requirements — Scope Lock

**Project:** BarBack
**Locked:** 2026-04-10
**Status:** LOCKED

---

## Problem
Bar staff spend ~5 hours/month manually counting liquor bottles and estimating fill levels. BarBack replaces pen-and-paper with phone camera + VLM identification, structured review, and actionable inventory data.

---

## MVP Features

### Mobile App (Ray)
- **Photo capture** — camera + photo library, batch queue (min batch of 1)
- **Location picker** — select sub-area within venue (Main Bar, Pool Bar, etc.) per session or per scan
- **VLM identification** — Claude Sonnet 4.6 via Agent SDK: bottle name (verbatim from catalog), category, fill level (0-10 tenths)
- **Progressive review** — SSE-streamed results populate a two-column ScrollView (thumbnail | editable data + fill slider)
- **User corrections** — editable fields for name, category, fill level. Corrections are implicit SME-annotated training data.
- **Session workflow** — capturing → processing → reviewing → confirmed
- **Tab navigation** — Capture | Inventory | Alerts | Settings (or similar)
- **Spreadsheet export** — CSV export of inventory data

### Backend (Jacob)
- **Framework:** Hono + Bun
- **Database:** PostgreSQL 16, Drizzle ORM
- **Schema:** venues, locations, venueMembers, bottles (shared catalog), sessions, scans, inventory — per `packages/backend/src/schema.ts`
- **VLM pipeline:** Accept batch of images → process through Claude → stream results via SSE
- **Auth:** Seeded username/password for initial dev. Sign up / sign in per dashboard specs.
- **Image storage:** TBD (S3/R2 recommended, `photoUrl`/`imageUrl` fields assume object storage)
- **Eval harness:** `packages/eval/` — Claude Agent SDK + LangSmith, 9 labeled Verbena photos, name accuracy + volume MAE

### Dashboard (Patrick)
- **Framework:** Vite + React + Mantine
- **Pages:** Inventory table, Low Stock, Sessions (list + detail), Settings
- **Public pages:** Landing, Sign in, Sign up, Onboarding (create/join bar)
- **Data contracts:** Defined in `packages/dashboard/specs/data-contracts.md`
- **Low-stock logic:** PAR-based thresholds — configurable per product with venue-level default fallback
- **CSV export:** Client-side generation from fetched JSON
- **Fixture-driven:** Development proceeds with fixture builders until backend APIs are ready

### Shared
- **Bottle catalog:** Global shared `bottles` table, all users reference same canonical products. Patrick researching UPC/GTIN-12 data sources (TTB COLA Registry, Iowa Liquor Products, commercial APIs).
- **Categories:** Full `itemCategoryEnum` — spirits (whiskey, bourbon, rye, scotch, shochu, vodka, gin, rum, tequila, mezcal, brandy, cognac, liqueur, amaro, vermouth), wine, beer, bitters, syrup, mixer, juice, puree, garnish, other, n/a
- **Fill level:** Integer 0-10 (tenths). VLM provides coarse estimate, user refines via slider.

---

## Capture Tiers (progressive, not all MVP)
- **Tier 1 (MVP):** Single bottle per photo
- **Tier 2 (post-MVP):** Shelf photo — multi-bottle identification. On-device sentry via RF-DETR Nano (Apache 2.0) + react-native-executorch. See `references/deep-research-rfdetr-nano-mobile.md`.
- **Tier 3 (post-MVP):** Video capture — continuous identification

---

## Stretch Goals
- Tier 2 + Tier 3 capture
- Historical trend visualizations
- Cost/value estimation (bottle cost, cost/oz, pour pricing — Verbena data shows this is real)
- Slow-seller flag to suppress false low-stock alerts
- Same-day photo metadata validation toggle
- Auto-ordering agent
- Email notifications
- Batched cocktail recipe tracking (Verbena data shows bars do this)
- Multi-venue switching in dashboard
- Barcode scanning (on-device via ML Kit / ZXing) for GTIN lookup

---

## Explicit Exclusions
- Distributor integrations
- Fixed camera installs
- Advanced roles/permissions beyond basic auth + venue membership
- Web-based bottle capture or editing
- Analytics/forecasting dashboards
- SAM 3 / YOLO integration (revisit for Tier 2/3 — YOLO26 excluded due to AGPL-3.0; RF-DETR Nano selected as Apache 2.0 alternative)
- On-device detection sentry in Tier 1 (deferred to Tier 2)
- Complex role models (manager vs staff vs owner)

---

## Key Technical Decisions

| Decision | Choice | Reference |
|---|---|---|
| VLM | Claude Sonnet 4.6 (Gemini fallback) | Eval harness in `packages/eval/` |
| Backend | Hono + Bun | `packages/backend/` |
| Database | PostgreSQL 16 + Drizzle ORM | `docker-compose.yml`, `drizzle.config.ts` |
| Mobile | Expo + Expo Router + VisionCamera v4.7.3 | Ray's domain |
| Dashboard | Vite + React + Mantine | `packages/dashboard/` |
| Eval/observability | LangSmith | `.env.example` |
| Image storage | TBD (S3/R2 likely) | — |
| Production hosting | TBD (free/low-cost + custom domain) | — |

---

## Deferred Decisions
- Image storage provider (S3 vs R2 vs other)
- Production hosting (Fly.io, Railway, Render, etc.)
- Production error handling strategy
- CI/CD pipeline
- Formal security review

---

## Presearch Coverage
- 13/16 criteria fully answered
- 3/16 partially answered (failure handling, security, deployment — all backend-side, not blocking mobile or dashboard)
- See `thoughts/shared/research/presearch_criteria.md` for full details
