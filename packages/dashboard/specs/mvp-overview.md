# Dashboard MVP Overview

## Purpose

The dashboard exists to support bar managers and staff after mobile capture is complete. It is not a second capture workflow. Its job is to make current inventory easy to inspect, act on, and export.

The dashboard is part of the product MVP.

## Primary Users

- Bar manager reviewing current stock and reorder risk
- Staff member checking the latest inventory counts
- Founder/demo user showing the product to prospects

## MVP Goals

- Provide a clear public landing page with sign in and sign up
- Show the current inventory in a usable table immediately after sign in
- Surface low-stock items that need attention
- Preserve a reviewable history of inventory sessions
- Allow export of operational data to CSV
- Establish a dashboard design system on Mantine before page implementation

## Non-Goals

- Web-based bottle capture
- Web-based bottle-by-bottle editing workflow
- Advanced analytics dashboards or forecasting
- Multi-location management
- Distributor integrations or auto-ordering
- Complex role and permission models beyond a lightweight bar-manager capability

## Core User Journeys

### 1. Prospect or new customer

1. User lands on the marketing page
2. User understands the product and clicks sign up
3. User creates an account
4. User creates a new bar or joins an existing bar
5. User is routed into the dashboard

MVP assumes self-serve sign up so early customers can adopt the product without a manual invite flow.

### 2. Manager checking current inventory

1. User signs in
2. User lands on the inventory table
3. User filters or searches for items of interest
4. User spots low-stock items and drills into details if needed
5. User exports CSV when they need to work elsewhere

### 3. Manager auditing a count session

1. User opens session history
2. User chooses a recent session
3. User reviews the final saved bottle records and thumbnails
4. User confirms what happened in that session without leaving the dashboard

## Navigation

The MVP app navigation should be:

- `Inventory`
- `Low Stock`
- `Sessions`
- `Settings`

Public routes:

- `Landing`
- `Sign in`
- `Sign up`

## Design System Decision

The dashboard will use Mantine as its web component foundation.

This is a speed and consistency decision, not a decision to accept Mantine defaults as the final product style. A dashboard-specific theme and component rules will be defined before implementation starts.

## Success Criteria

- A new user can reach sign up from the landing page without confusion
- A signed-in user can understand current inventory status from the default screen
- A signed-in user can identify low-stock items within one click from the main nav
- A signed-in user can inspect past sessions and understand what was saved
- A signed-in user can export useful CSV data without manual data cleanup

## Dependencies

- Basic authentication
- Inventory and session data returned from the backend
- Stable identifiers for bottles and sessions
- Export endpoint or client-generated CSV based on fetched data
- A single-bar tenancy model for each user in MVP

## Risks

- If inventory data is incomplete, the table may not support useful operations
- If low-stock logic is unclear, the reorder queue will feel arbitrary
- If session detail lacks thumbnails or correction metadata, audit value drops
