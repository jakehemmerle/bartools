# Stitch Handoff Selection

This document identifies the canonical mockups and locked design choices for the BARTOOLS web reports workbench handoff.

Use this when:
- aligning with the mobile team on visual direction
- aligning with the backend team on semantic correctness
- deciding which Stitch exports should influence implementation
- rejecting mockup content that looks polished but is not product-truthful

## Goal

Leave the Stitch project in a state where the winning design direction is obvious without requiring the other team to reverse-engineer our taste from multiple partial exports.

That means:
- one clear visual family
- one clear interaction model
- one clear report vocabulary
- no lingering fake product scope
- no leftover dev-process copy

## Source Of Truth

The handoff should defer in this order:

1. Backend truth for functionality and nouns
2. Mobile app truth for visual language
3. These selected web mockups for page composition and desktop adaptation

If a mockup conflicts with backend or mobile truth, the mockup loses.

## Handoff Verdict

The approved screen set has been consolidated into `golden-set-approved/`.

The current recommendation is:

- use `golden-set-approved/` as the preferred visual reference bundle
- keep this document as the canonical handoff explanation

Why this matters:

- the approved screens are visually aligned with the dark-first BARTOOLS direction
- the worst fake-product copy has been removed
- the per-record submit buttons are gone
- the remaining action model is close enough to backend truth to implement carefully
- the bundle now lives in one stable repo location instead of being scattered across multiple Stitch export passes

## Canonical Screen Winners

These are the screens we should treat as the current winners.

### Entry And List

- Entry surface:
  `golden-set-approved/reports_workbench_entry`
- Reports list:
  `golden-set-approved/reports_list`
- Reports list empty state:
  `golden-set-approved/reports_list_empty_state`
- Blocked state:
  `golden-set-approved/report_detail_blocked_state`
- Not found state:
  `golden-set-approved/report_detail_not_found_state`

### Detail States

- Created:
  `golden-set-approved/report_detail_created`
- Processing:
  `golden-set-approved/report_detail_processing`
- Unreviewed:
  `golden-set-approved/report_detail_unreviewed_revised`
- Reviewed:
  `golden-set-approved/report_detail_reviewed_revised`
- Comparison emphasis:
  `golden-set-approved/report_detail_comparison_emphasis_final`
- Failed emphasis:
  `golden-set-approved/report_detail_failed_emphasis_final`

## Locked Design Decisions

These decisions should be visually reinforced in the final Stitch handoff.

### Product Framing

- This is a reports workbench, not a dashboard.
- The app exists to inspect reports and review records.
- The UI must not imply inventory, low stock, settings, auth, analytics, export centers, or broader admin scope.

### Vocabulary

- Use `report`, never `session`.
- Use `record` for report items.
- Use `venue` and `location` only where backend truth actually requires them.
- Do not bring back `inventory report`, `capture ID`, `batch`, `variance`, `discrepancy`, or similar invented nouns.

### Visual Tone

- Dark-first composition should dominate.
- Mobile-derived typography and color language should dominate over generic web-dashboard instincts.
- The surface should feel calm, precise, and operational.
- The design should feel like a desktop extension of BARTOOLS, not a separate SaaS product.

### Layout And Shell

- Keep the shell minimal.
- No sidebar.
- No utility rail.
- No analytics strip.
- No “command center” framing.
- Detail screens should feel like a reading and review surface, not a control room.

### Actions

- Action hierarchy must stay restrained.
- Review actions are report-level, not per-record, unless backend truth changes.
- Avoid decorative side actions.
- Avoid fake actions such as export, close report, discard, approve valid, or process advice that the backend does not support.

### Review Controls

- Review controls are limited to bottle/product match and fill level selection.
- Fill level should be communicated in tenths from `0` to `10`.
- Do not use percentages in visible copy for the review control.
- Do not use decimals like `4.2`.
- Do not use 0.0 to 1.0 scales.

### Comparison Presentation

- Comparison screens should clearly distinguish original model output from corrected final values.
- The corrected side should feel resolved but not celebratory.
- The comparison should focus on corrected fields, not invent new workflow chrome.

### Failure Presentation

- Failed records should feel recoverable and operational, not catastrophic.
- Error blocks should be specific and useful.
- Error language must remain within product reality.
- Do not mention weight entry, kilograms, glass container types, or other unsupported capture models.

## Copy Backpressure

The final Stitch state should remove any copy that exists because of our design process instead of the product.

Never allow:
- MVP labels in product UI
- workflow commentary
- design philosophy slogans
- implementation notes
- “operator console” theater
- “inventory intelligence” fluff
- pseudo-enterprise filler copy
- actions that exist only to make a screen feel busy

## Known Mockup Defects To Fix Or Ignore

These issues are still present in the selected exports and should not be mistaken for approved product decisions.

### Failed Emphasis Screen

In `golden-set-approved/report_detail_failed_emphasis_final`:

- the page now matches the dark-first BARTOOLS family much better
- per-record submit buttons are gone, which is a major improvement
- the bogus weight-entry and kilogram language is gone
- the bottom action label is now a single report-level `Submit Review`, which is acceptable but should still be implemented carefully against the backend review contract

### Comparison Emphasis Screen

In `golden-set-approved/report_detail_comparison_emphasis_final`:

- visible UI is handoff-ready
- the original-versus-corrected presentation is clear and restrained
- internal HTML comments still say `fillPercent`, but that is not user-facing and should not drive product language

## What The Other Team Should Be Able To See Immediately

After the final Stitch cleanup pass, a reviewer should be able to understand:

- which screens are canonical
- what the desktop BARTOOLS shell feels like
- how reports move from processing to review
- how unreviewed, reviewed, failed, and comparison-heavy states differ
- how bottle selection and fill-level correction should look
- what kinds of actions are intentionally absent

If a reviewer instead comes away asking whether we also designed inventory, settings, export, or admin surfaces, the handoff has failed.
