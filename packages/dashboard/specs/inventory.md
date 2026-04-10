# Inventory Spec

## Purpose

Make current inventory easy to inspect and export. This is the default signed-in screen.

For MVP, inventory is the current on-hand stock by product, with each row showing the most recently confirmed state for that product and an `as of` date.

Dates and times in the dashboard should use the bar's local timezone.

## In Scope

- Inventory table
- Search
- Basic filtering
- Row drill-in if needed
- CSV export entry point

## Out Of Scope

- Bulk edits
- Inline editing of bottle fields
- Reconciliation workflows
- Charts and trend visualizations

## User Stories

- As a manager, I want to see current stock in one place
- As a manager, I want to find specific bottles quickly
- As a manager, I want low-stock status visible in the main inventory view
- As a manager, I want to export the current dataset

## Table Columns

Minimum recommended columns:

- Product name
- Category or type
- UPC
- On-hand quantity
- PAR level
- Low-stock status
- As of date
- Last session id or link

Optional MVP columns if data is readily available:

- Product size / volume
- Fill percent

## Visual Direction

- This page should read as an operational tool, not a marketing page
- Table density should prioritize scan speed over decorative spacing
- Mantine table primitives are acceptable, but the final table styling should use dashboard-specific tokens for spacing, borders, and radius
- Filters and controls should prefer squared or softly rounded controls over pill-shaped controls
- Stale inventory should be communicated subtly and informatively, not as an alarm state

## Page Actions

- Search by product name
- Filter by low-stock status
- Sort by product name
- Sort by on-hand quantity
- Sort by `as of` date
- Export CSV

## Pagination

- MVP does not include pagination
- The inventory dataset should load as a single list for now
- Pagination can be introduced after MVP if real usage and dataset size require it

## Empty State

- Explain that no inventory has been confirmed yet
- Provide a short note that inventory is created from mobile sessions
- Keep the tone calm and operational

## Loading State

- Table skeleton or simple loading state

## Error State

- Non-destructive error message with retry action
- Keep the tone calm and operational

## Freshness Behavior

- Every row shows an `as of` date
- Inventory older than 14 days should receive a subtle stale warning treatment
- Stale treatment is informational only and does not block actions
- MVP does not include a separate page-level `last updated` indicator

## Row Behavior

Inventory remains table-only in MVP. If a row click action exists, it should route to the latest related session detail rather than a dedicated product detail page.

## Acceptance Criteria

- Signed-in users land here by default
- Users can search inventory by bottle name
- Users can identify low-stock items without changing pages
- Users can export the currently viewed dataset to CSV
- Users can understand when inventory is empty, loading, or unavailable
- Each row represents current on-hand stock for a product and includes an `as of` date
- Inventory older than 14 days is subtly marked as stale without forcing user action
- The page remains usable on desktop, tablet, and phone-sized web layouts
- Core inventory interactions are keyboard navigable and use accessible table and control semantics
