# Low Stock Spec

## Purpose

Provide an operational queue of inventory items that may require reorder attention.

## In Scope

- Dedicated low-stock view
- Simple reorder-priority list based on inventory state
- Filters and sorting relevant to operational review

## Out Of Scope

- Purchase order generation
- Distributor integrations
- Auto-ordering
- Demand forecasting

## User Stories

- As a manager, I want a concise list of bottles that need attention
- As a manager, I want to understand why an item is flagged
- As a manager, I want to export the flagged list if I am reordering elsewhere

## List Contents

Minimum row fields:

- Product name
- UPC
- Current on-hand quantity
- PAR level
- As of date
- Reason flagged

## Visual Direction

- The page should communicate urgency through hierarchy and color, not through a pile of badges or pills
- Severity cues should be limited and consistent

## Flagging Logic

MVP decision:

- Mark a product as `below par` when its current total on-hand stock is below its PAR level
- Partial bottles and full bottles both contribute to total on-hand stock
- PAR is defined per product
- A bar-level default PAR may be used as the starting point when a product-specific PAR has not been set

This keeps the view aligned with product-level inventory management rather than single-bottle alerts.

The values that drive `below par` are configured in the dashboard `Settings` surface.

## Page Actions

- Filter by severity if supported
- Sort by lowest on-hand quantity
- Sort by `as of` date
- Export CSV

## Empty State

- Explain that no low-stock items are currently flagged

## Acceptance Criteria

- Users can open a focused low-stock list from the main nav
- Every flagged item shows enough context to explain why it appears
- The page reflects product-level `below par` status based on total on-hand stock
