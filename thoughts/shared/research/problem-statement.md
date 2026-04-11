# Problem Statement

Bar staff spend ~5 hours/month manually counting liquor bottles and estimating fill levels for reorder decisions. The process is pen-and-paper or spreadsheet-based (see Verbena's real spreadsheet in `assets/verbena_inventory.xlsx`), error-prone, and disconnected from ordering workflows. BarBack aims to replace this with a phone camera: snap a photo, let a vision-language model identify the bottle and estimate fill, let the user correct any mistakes, and produce actionable inventory data with visualizations and export.

## Capture Tiers (progressive capability)
- **Tier 1 (MVP):** Single bottle per photo — prove identification works reliably
- **Tier 2:** Shelf photo — multi-bottle identification from one image
- **Tier 3:** Video capture — continuous identification from video feed

## Real-World Validation
Verbena bar inventory data (~397 products across spirits, bitters, syrups, mixers, garnishes) confirms:
- Bars track fractional bottle fill levels (0.05 increments)
- Multiple locations per venue (Main Bar, Pool Bar, Liquor Room, etc.)
- Non-spirit items share the same inventory workflow
- Cost tracking (bottle cost, cost/oz, pour pricing) is core to operations
