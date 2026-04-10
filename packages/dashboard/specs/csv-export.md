# CSV Export Spec

## Purpose

Allow users to move inventory data into spreadsheets or external systems with minimal friction.

## In Scope

- Export from inventory
- Export from low-stock view

## Out Of Scope

- Session export
- Scheduled exports
- Native integrations with spreadsheet tools
- Custom export builders

## User Stories

- As a manager, I want to export inventory so I can use it in other tools
- As a manager, I want the exported file to match the view I am looking at

## Export Behavior

### Inventory Export

- Exports the current inventory dataset
- If filters are active, the exported file should match the filtered view
- If sorting is active, the exported file should preserve the current sort order
- Export should include all matching rows, not just the currently visible page

### Low-Stock Export

- Exports only flagged low-stock items
- Preserves the current filters and sort order for the low-stock view

## Schema Strategy

- CSV schemas may differ by export surface
- Inventory export and low-stock export should each include the columns most useful for that context
- Column naming should still remain stable and human-readable within each export type

## Filename Guidance

Suggested patterns:

- `inventory-YYYY-MM-DD.csv`
- `low-stock-YYYY-MM-DD.csv`

## Timestamp Behavior

- Timestamps in CSV exports should use the bar's local timezone

## Inventory Export Columns

Required columns:

- Product name
- Category or type
- UPC
- On-hand quantity
- PAR level
- Below par status
- As of date

Optional columns:

- Volume
- Latest session id

## Low-Stock Export Columns

Required columns:

- Product name
- Category or type
- UPC
- On-hand quantity
- PAR level
- Below par reason
- As of date

Optional columns:

- Volume
- Latest session id

## Acceptance Criteria

- Export is accessible from the relevant page without extra navigation
- CSV headers are stable and human-readable
- The exported data matches what the user expects from the current page context
- CSV export reflects the current filters and sort order across all matching rows
- Different export surfaces may use different context-appropriate schemas
- Exported timestamps use the bar's local timezone
