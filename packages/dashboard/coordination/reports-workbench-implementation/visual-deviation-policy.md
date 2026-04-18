# Visual Deviation Policy

## Purpose

This document defines which visual deviations are acceptable without asking and which ones should stop the run.

It exists because "match the mockups" is not enough guidance for unattended work.

## Core Rule

The approved golden set is the target.

Deviate only when:
- the deviation preserves the same hierarchy and semantics
- the deviation is needed for responsive behavior, accessibility, or real content lengths
- the deviation does not broaden product scope or change the interaction model

## Must Match Exactly

These are not optional:

- route coverage
- screen family coverage
- blocked vs not-found vs real detail distinction
- allowed and forbidden actions
- backend-truth nouns
- report-level review model
- unsupported-surface hiding
- dark-first product family
- major block order on each approved screen

If one of these changes, stop and fix it.

## Must Match Closely

These should stay very close to the approved screens:

- shell composition
- typography hierarchy
- spacing rhythm
- surface layering
- status emphasis
- original-versus-corrected hierarchy
- failed-state tone
- list row density

These may vary slightly only if the screen still reads as the same product.

## Allowed Without Asking

These deviations are acceptable without prompting:

- line-wrap differences caused by real content lengths
- small spacing adjustments needed to avoid collisions
- responsive stacking or collapse that preserves the intended hierarchy
- placeholder imagery differences
- focus-ring and accessibility affordance details inside the token system
- slight radius or shadow tuning that still fits the token contract
- minor text shortening when needed to preserve truthful UI composition

## Allowed With Notes, Not With Drama

These are acceptable as `pass-with-notes` results:

- one block sits slightly taller than in the mockup
- a narrow-width layout needs a cleaner collapse than the static reference implies
- a metadata line wraps differently with real timestamps
- a control needs slightly different spacing to remain keyboard-usable

Do not stop the run for these alone.
Record them and continue.

## Stop Conditions

Stop and ask if a deviation would:

- add or remove a major screen block
- change the visible action set
- change the status hierarchy
- make the shell feel like a different product family
- imply unsupported backend capabilities
- require inventing new product copy to explain something the plan does not cover
- resolve a design ambiguity in two materially different plausible ways

## Truth Wins

If there is tension between visual fidelity and product truth:

1. backend truth wins
2. current product scope wins
3. accessibility wins
4. the approved visual hierarchy wins

This means:
- do not fake capability to match a pretty mockup
- do not keep misleading copy because it fits the composition better
- do not remove important accessibility affordances just to look closer to a static export

## Family Rule

A screen should be judged as part of its family, not as an isolated artifact.

That means:
- entry should feel related to list
- list should feel related to detail
- detail variants should feel like one coherent family

If a local optimization improves one screen but breaks the family resemblance, reject it.

## Overnight Execution Rule

During a long unattended run:

- continue through minor visual notes
- stop only for semantic or family-level drift
- prefer the more conservative visual choice when the mockup leaves room for interpretation

## Success Condition

This policy is working if the implemented screens are recognizably the approved BARTOOLS product, but the run does not grind to a halt over trivial pixel drama.
