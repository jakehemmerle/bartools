# Settings Spec

## Purpose

Provide the minimum configuration surface required for the dashboard MVP to behave correctly.

This surface assumes a user already belongs to a bar. Initial bar creation or joining happens during post-signup onboarding.

## In Scope

- Bar timezone
- Bar-level default PAR
- Product-specific PAR overrides
- Lightweight invite link generation for additional employees

## Out Of Scope

- Multi-bar management
- Full team management
- Billing
- Distributor integrations
- Advanced preferences

## User Stories

- As a bar owner or manager, I want to set my bar timezone so dates and times are shown correctly
- As a bar owner or manager, I want to set a default PAR level so the product has a sensible baseline
- As a bar owner or manager, I want to override PAR by product so `Below Par` reflects real operational needs
- As an existing employee, I want to generate an invite link so another employee can join the same bar
- As a bar manager, I want to grant manager access to another employee so the bar is not dependent on one account

## Sections

### Bar Settings

Required fields:

- Timezone
- Default PAR level

### Product PAR Overrides

Required capabilities:

- Search products by name
- View current override value if one exists
- Add or update a per-product PAR override
- Remove an override and fall back to the bar default

### Team Access

Required capabilities:

- Generate an invite link for another employee at the same bar
- Grant the lightweight manager capability to another member of the same bar
- Keep invite handling lightweight and utilitarian
- Do not expand this into full team management for MVP

### Permission Model

- MVP uses one lightweight permission capability: `canManageBar`
- Users with `canManageBar` can edit bar settings, manage product PAR overrides, generate invite links, and grant manager capability to other existing members
- The first user who creates a bar receives `canManageBar` by default

## Visual Direction

- Settings should feel minimal and utilitarian, not like a broad admin console
- Product PAR overrides should use a compact searchable table, not a card-heavy layout

## Acceptance Criteria

- Users can set the bar timezone in MVP
- Users can set a bar-level default PAR in MVP
- Users can add, edit, and remove product-specific PAR overrides in MVP
- Low-stock behavior can be meaningfully configured without leaving the dashboard
- Existing employees can generate invite links so additional employees can join the same bar
- Users with manager capability can grant that capability to other existing members of the same bar
