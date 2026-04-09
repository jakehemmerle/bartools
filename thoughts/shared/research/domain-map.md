# Domain Map

## Users
- **Bar manager/staff** — performs inventory counts, reviews VLM results, places reorders
- (Future) **Bar owner** — views trends, cost analysis, multi-location rollups

## Team
- **Ray** — mobile app (Expo/RN)
- **Jacob** — backend, VLM/image processing, some GTM strategy
- **Patrick** — bottle database/UPC research, web management dashboard (potentially post-MVP)

## Core Workflow (Tier 1 MVP)
1. User opens app, starts an inventory session
2. Takes photos of individual bottles (camera or photo library)
3. Submits batch to backend
4. Backend processes each image through Gemini 2.5 Flash, returns results progressively (SSE)
5. User reviews two-column ScrollView: thumbnail | identified data + fill slider
6. User corrects any misidentifications, adjusts fill levels
7. User confirms → data persisted to inventory
8. User views current inventory snapshot + reorder alerts

## Data Entities
- **Bar** — name, location, settings (reorder thresholds, photo validation rules)
- **User** — auth identity, bar association, role
- **Inventory Session** — timestamp, bar, user, status (in-progress/confirmed)
- **Bottle Record** — brand, release/type, vintage, UPC/GTIN-12, volume, fill level (0-100%), photo URL, session reference
- **Reorder Alert** — per-bottle/brand, triggers when fill <25% AND no backup bottle in inventory. Stretch: slow-seller flag to suppress false positives.

## External Dependencies
- **Gemini 2.5 Flash API** — VLM for bottle identification + fill estimation
- **Image storage** — TBD (S3/R2 vs Postgres, deferred)
- **Database** — TBD (Postgres likely, deferred)

## System Boundary
- **In scope:** Mobile app, backend API, VLM integration, inventory persistence, basic viz
- **Out of scope (MVP):** Distributor integrations, auto-ordering agent, fixed cameras, multi-bar management, user roles/permissions beyond basic auth, web management dashboard (Patrick, post-MVP)
