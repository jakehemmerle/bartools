# Domain Map

## Users
- **Bar manager/staff** — performs inventory counts, reviews VLM results, manages reorders via dashboard
- **Dashboard user** — reviews confirmed inventory, low-stock alerts, session history, CSV export
- (Future) **Bar owner** — views trends, cost analysis, multi-location rollups

## Team
- **Ray** — mobile app (Expo/RN)
- **Jacob** — backend (Hono+Bun), VLM/image processing, eval harness, some GTM strategy
- **Patrick** — bottle database/UPC research, web management dashboard (Mantine/React)

## Core Workflow (Tier 1 MVP)
1. User opens app, starts an inventory session for a venue
2. Selects location within venue (Main Bar, Pool Bar, etc.)
3. Takes photos of individual bottles (camera or photo library)
4. Submits batch to backend
5. Backend processes each image through VLM (model TBD — eval harness testing Claude Sonnet 4.6), returns results progressively (SSE)
6. User reviews two-column ScrollView: thumbnail | identified data + fill slider (0-10 tenths)
7. User corrects any misidentifications, adjusts fill levels (corrections serve as SME-annotated training data)
8. User confirms → data persisted to inventory per location
9. User views current inventory snapshot + low-stock alerts on dashboard
10. User exports CSV as needed

## Data Entities (per `packages/backend/src/schema.ts`)
- **User** — auth identity, display name
- **Venue** — establishment (bar, restaurant, etc.)
- **VenueMember** — join table, many-to-many users ↔ venues (no roles for MVP)
- **Location** — sub-area within a venue (Main Bar, Pool Bar, Liquor Room, Cooler, Backstock). Unique name per venue.
- **Bottle** — canonical product: brand, product name, category (`itemCategoryEnum` — spirits, beer, wine, bitters, syrups, mixers, garnishes, etc.), subcategory, sizeMl, vintage, ABV, UPC/GTIN-12, reference image URL
- **Session** — groups scans from a single inventory count. Status: capturing → processing → reviewing → confirmed. Tracks photo/processed counts.
- **Scan** — per-photo record: session ref, location ref, bottle match (nullable if unrecognized), photo URL, `vlmFillTenths` (0-10), confidence score, raw VLM response, model used, latency
- **Inventory** — current state per (location, bottle). `fillLevelTenths` (0-10), last scan ref, notes. Unique constraint on (location, bottle).

## Reorder/Low-Stock Logic
- **Dashboard specs:** PAR-based thresholds — configurable per product with a venue-level default fallback
- **Comparable units:** milliliters preferred; `bottle_equivalent` fallback when mL normalization isn't reliable
- **"Backup" detection:** derived by checking if the same bottle exists in another location within the venue (replaces our earlier `backstockQuantity` concept)
- **Stretch:** slow-seller flag to suppress false positives

## External Dependencies
- **VLM API** — Claude Sonnet 4.6 via Agent SDK (leverages Claude Code subscription). Gemini 2.5 Flash as fallback if pivot needed.
- **LangSmith** — eval tracking, experiment comparison, tracing
- **PostgreSQL 16** — confirmed (docker-compose.yml)
- **Drizzle ORM** — confirmed (drizzle.config.ts)
- **Image storage** — TBD (S3/R2 likely, `photoUrl`/`imageUrl` fields assume object storage)

## Bottle Catalog Data Sources (from `docs/deep-research-report-bottles-api.md`)
- **TTB Public COLA Registry** — label images, free
- **Iowa Liquor Products** — UPC + pricing, CC BY 4.0
- **Open Food Facts** — some alcohol coverage, ODbL share-alike licensing constraint
- **Commercial APIs** — Barcode Lookup, UPCitemdb, Go-UPC ($75-700/mo)
- **Verbena inventory** — real bar data used as fixture and eval ground truth

## System Boundary
- **In scope (MVP):** Mobile app, backend API, VLM integration, inventory persistence, dashboard (inventory table, low-stock, sessions, settings, CSV export), basic auth
- **Out of scope (MVP):** Distributor integrations, auto-ordering agent, fixed cameras, multi-venue switching in dashboard, advanced roles/permissions, web-based capture, analytics/forecasting
