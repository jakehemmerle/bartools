# Backstock Reports

## Purpose

Define the first web-native creation workflow for the dashboard: backstock reports for full bottles.

This is intentionally **not** a duplicate of the mobile photo-and-review workflow.
It is a separate operational tool for desktop use when staff need to count full bottles in backstock quickly and calmly.

## Product Position

Backstock reports exist because the team does **not** want the web dashboard to become a second copy of the mobile scan flow.

The web dashboard should support a different job:

- photographing many bottles in backstock
- generating product-level quantity suggestions from those photos
- correcting grouped counts quickly
- allowing direct manual entry when photos are not preferred
- preserving an audit trail of what was submitted

## MVP Summary

The first version should be:

- desktop-first
- manual-or-photo-assisted
- location-scoped
- full-bottle-only
- operator-correctable

This means the operator should be able to create a backstock report by:

1. choosing a backstock location
2. either uploading one or more backstock photos up front, or starting from an empty manual draft
3. receiving a generated draft grouped into product line items with integer bottle counts when photos are used
4. correcting products or quantities as needed
5. reviewing the summary
6. submitting the report

In MVP, photos should be able to prefill or auto-generate the draft when the operator chooses to use them.
The operator remains responsible for reviewing and correcting the grouped line items before submit.
Manual line-item entry should remain available as a first-class path when photo generation is unavailable, incomplete, or simply not preferred.

## Definitions

### Backstock Report

A structured report describing the quantity of full bottles currently held in a backstock location.

### Full Bottle

A bottle that should be counted as one whole unit for backstock purposes.

MVP assumption:

- backstock reports do not track partial fill
- backstock reports do not use fill sliders

### Line Item

A product plus an integer quantity of full bottles.

Example:

- Campari, quantity `6`
- Tito's Handmade Vodka 750ml, quantity `12`

### Source Photo

A photo uploaded up front as count input for draft generation and retained as needed for audit, operator reference, or future model assistance.

## Proposed MVP Behavior

### Creation Flow

The dashboard should provide a `New Backstock Report` action.

The creation flow should let the operator:

- choose one location
- optionally upload one or more backstock photos up front
- generate a grouped draft from those photos when provided
- start from manual line items when photos are skipped
- review products suggested by the system
- set or correct a full-bottle quantity for each product
- search the product catalog and add missing products
- remove products from the draft
- review totals before submit

### Submission Model

This draft assumes **snapshot semantics** by default:

- a submitted backstock report represents the operator's view of the current full-bottle backstock state for that location at that moment
- it is not phrased as "add 6 bottles" or "remove 2 bottles"
- it is phrased as "there are 6 bottles now"

This is the calmest and least ambiguous default for MVP.

If the team later decides the workflow should be delta-based instead, that decision should be made before implementation begins.

### History And Audit

A submitted backstock report should remain reviewable later.

The detail view should preserve:

- location
- operator
- submitted timestamp
- product line items
- total bottle count
- source photos if retained

Whether backstock history lives inside the existing reports area or in a separate backstock surface is still open.

## UX Rules

### What The User Should Feel

- calm
- fast
- operational
- not forced through bottle-by-bottle correction UI

### What The UI Should Avoid

- fill sliders
- bottle-by-bottle photo cards as the primary interaction
- language that implies this is the normal mobile scan workflow
- surprising inventory math hidden behind vague labels

### Preferred Interaction Model

The main unit of work should be the line item.

Each line item should make it easy to:

- search a product
- confirm the chosen product
- edit quantity
- remove the row

The UI should optimize for rapid keyboard and mouse entry after generation completes.
It should avoid forcing the operator through bottle-by-bottle confirmation as the primary correction path.

## Photos As Input In MVP

Source photos are an optional capture input for this workflow, and when used they belong at the start of report creation.

### MVP Photo Role

Photos may be:

- generation input for suggested products and counts
- operator reference during review
- stored material for future model work or audit

Photos should **not** be required to:

- create a backstock report
- perfectly determine every product or quantity without human review
- force the operator into per-bottle correction cards
- infer partial fill state
- replace manual add/edit/remove controls for line items

The system should treat uploaded photos as up-front source input, then collapse the result into editable line items grouped by product.
It should not frame photos as something the operator adds later to an already-started draft just for evidence.

### Upload Transport

When photos are used, the dashboard should assume an upload flow compatible with a serverless backend.

That likely means:

- requesting presigned upload targets first
- uploading source photos directly to object storage
- then creating or generating the initial draft against those uploaded assets

The photo-assisted backstock path should reuse the same upload contract shape as mobile where practical.

## Dashboard-Facing Contract Assumptions

From the dashboard point of view, the product likely needs a dedicated backstock contract rather than forcing this workflow through the existing per-record report shape.

The key objects are:

- backstock report
- backstock line item
- source photo

The dashboard should not have to invent product counts locally from raw photos or bottle-level records.
The service should return grouped line-item suggestions that the operator can edit before submission.

## Non-Goals

This spec does **not** include:

- a second copy of the mobile scan workflow on web
- fill-level editing for backstock counts
- bottle-by-bottle correction as the primary web interaction
- case/box inventory in MVP
- inventory forecasting
- distributor ordering flows

## Initial Recommendation

Build backstock reporting as:

- a distinct web-native workflow
- manual or photo-assisted draft creation
- product-level line items
- integer counts of full bottles
- snapshot semantics
- audit-friendly submitted detail

## Current Direction

- submitted backstock reports should appear inside the existing reports area
- backstock reports should use snapshot semantics
- source photos should be optional, and when used they should prefill or auto-generate grouped line items from the start of the workflow
- the editable draft can remain frontend-local in MVP after generation returns, even though photo upload and generation require backend support
- photo upload should use a presigned-URL flow compatible with the serverless backend rather than routing large image blobs through the app server

## Open Questions

1. Does submitting a backstock report update inventory immediately, or does it create a separate review/approval step?
2. How should low-confidence or partial-coverage counts surface for operator correction?
3. Should submitted detail always retain the source photos, or can that be configurable later?
