# Stitch Prompt V4.3: Final Handoff Pass

Use this in the existing BARBACK v4 Stitch project by answering:

`What do you want to change or create?`

```text
Revise the current BARBACK web project in place.

This is not a new exploration pass.
This is not a redesign pass.
This is not a “make it cooler” pass.

The goal is to leave the project in a clean handoff state for the mobile and backend teams.

That means:
- the winning design direction is obvious
- the product scope is narrow and truthful
- the report workflow is visually consistent
- unsupported features are not implied
- bad leftover copy is removed
- the final project feels coherent enough to hand to another team without an oral tradition


==================================================
1. HANDOFF GOAL
==================================================

Turn the current project into a final design-direction handoff for the BARBACK web reports workbench.

The project should communicate:
- this is a desktop companion to the mobile BARBACK product
- this is a reports-first review surface
- the backend reports workflow is the functional truth
- the chosen desktop patterns are now settled enough to implement

Do not reopen product strategy.
Do not invent new surfaces.
Do not add feature ideas.
Do not add explanatory marketing copy.
Do not add implementation-process language.


==================================================
2. HIGH-LEVEL INSTRUCTION
==================================================

Keep the current project structure.
Refine and normalize the existing screens so the final choices feel deliberate and shared.

Your job is to consolidate, not expand.

Preserve the narrow screen set:
- entry surface
- reports list
- reports list empty state
- report detail created
- report detail processing
- report detail unreviewed
- report detail reviewed
- report detail failed emphasis
- report detail comparison emphasis
- blocked state
- not found state

Do not add:
- inventory
- low stock
- settings
- signup
- sign in
- password reset
- analytics
- profile
- exports center
- utility dashboards
- sidebars
- floating utility trays
- design system pages
- mood boards
- bonus concepts


==================================================
3. DESIGN SOURCE OF TRUTH
==================================================

Defer to the BARBACK mobile app visual language.

This web workbench should feel like a desktop adaptation of the mobile product:
- dark-first
- restrained
- editorial but operational
- warm metal accents against deep charcoal surfaces
- no generic SaaS brightness
- no enterprise dashboard chrome

The desktop UI may breathe more than mobile, but it must remain obviously from the same family.


==================================================
4. FUNCTIONAL SOURCE OF TRUTH
==================================================

Defer to backend truth.

Core entity:
- report

Allowed report states:
- created
- processing
- unreviewed
- reviewed

Allowed record states:
- pending
- inferred
- failed
- reviewed

Allowed review concepts:
- bottle or product match
- fill level in tenths

Do not imply support for:
- inventory management
- low stock workflows
- settings
- team administration
- export tooling
- per-record submission if backend review is report-level
- unsupported capture methods


==================================================
5. SPECIFIC FINALIZATION WORK
==================================================

Normalize the project so the canonical choices are visually obvious:

1. Make the shell consistent across all report-detail states.
2. Make the reports list and empty states clearly part of the same family.
3. Keep the dark-first BARBACK mood consistent throughout.
4. Reduce any remaining ornamental UI that exists only to “make a dashboard.”
5. Remove any copy or action that looks like dev-process leakage or product-scope hallucination.


==================================================
6. LOCKED PRODUCT LANGUAGE
==================================================

Use:
- report
- record
- bottle
- product match
- fill level
- original model output
- final corrected values
- blocked
- not found

Do not use:
- session
- inventory report
- capture ID
- batch
- variance
- discrepancy
- command center
- operator console
- approval queue
- export data
- close report
- approve valid
- discard


==================================================
7. LOCKED INTERACTION RULES
==================================================

These decisions are settled and should be reinforced, not debated:

- Review controls are limited to bottle/product match and fill level selection.
- Fill level is communicated in tenths from 0 to 10.
- Visible UI must not use percent labels for fill correction controls.
- Visible UI must not use decimal fill values like 4.2.
- Detail screens should not accumulate decorative secondary actions.
- The design should stay calm and operational.


==================================================
8. REQUIRED SCREEN FIXES
==================================================

The following problem areas must be corrected in the current project.

FAILED EMPHASIS SCREEN:
- Make the overall page dark-first so it sits inside the same BARBACK visual family as the other winning screens.
- Remove per-record submit buttons.
- Keep only the report-level review submission pattern.
- Keep the page operational and recoverable, not alarming.
- Remove any bad failure copy that refers to manual weight entry, kilograms, container type, or other unsupported capture concepts.

COMPARISON EMPHASIS SCREEN:
- Keep the current direction.
- Preserve the strong original-vs-corrected split.
- Preserve report-id-first identity.
- Preserve corrected values as the resolved side.
- Do not reintroduce side actions or fake workflow controls.

UNREVIEWED AND REVIEWED SCREENS:
- Preserve the current successful direction.
- Keep them visually in the same family as the normalized failed and comparison screens.

ENTRY, LIST, EMPTY, BLOCKED, AND NOT FOUND:
- Keep the current narrow, truthful framing.
- Ensure nothing about these screens implies broader product scope.


==================================================
9. HANDOFF CLARITY
==================================================

A teammate looking at the finished project should be able to identify, without extra explanation:
- what the web product is
- what it is not
- what the core report states are
- how review works
- what actions are intentionally absent
- what the approved visual direction is

If the result still feels like a partly-correct design exploration, it has failed.
It should feel like a settled implementation reference.


==================================================
10. COPY HYGIENE
==================================================

Strip out any copy that exists because of our process rather than the product.

Remove:
- MVP labels
- design-philosophy slogans
- meta commentary
- fake “operational strategy” language
- vague enterprise filler
- dramatic “system intelligence” copy

Keep copy literal, calm, and product-truthful.


==================================================
11. FINAL QUALITY BAR
==================================================

Before you finish, validate the following:

1. Does every screen still belong to one coherent BARBACK family?
2. Is the reports-first scope visually unmistakable?
3. Are unsupported surfaces absent rather than merely de-emphasized?
4. Are the report-detail states semantically different without turning into different products?
5. Are failed records handled calmly and truthfully?
6. Is the review interaction limited to bottle/product match plus fill level in tenths?
7. Is the action model restrained and backend-truthful?
8. Have all leftover fake-product or dev-process words been removed?
9. Would another team be able to use this project as an implementation-facing design handoff?

If the answer to any of those is no, revise the project before stopping.
```
