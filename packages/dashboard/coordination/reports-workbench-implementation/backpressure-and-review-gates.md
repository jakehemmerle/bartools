# Backpressure And Review Gates

This document exists to answer one question:

How do we stop implementation from slowly mutating into the wrong app while still making steady progress?

The answer is deliberate backpressure.

Backpressure means:
- defining what counts as drift
- making review routes cheap to check
- refusing to treat “technically works” as good enough
- requiring each phase to satisfy explicit gates before the next one begins

The main enforcement documents are:
- `visual-token-spec.md`
- `state-visibility-matrix.md`
- `screen-composition-spec.md`
- `review-evidence-protocol.md`
- `architecture-renegotiation-protocol.md`

## The Main Failure Modes

These are the most likely ways the work can go wrong.

### 1. Library Gravity

Symptoms:
- screens start looking like generic component examples
- page spacing and hierarchy feel framework-default
- interactive primitives quietly start dictating layout

Counter-pressure:
- BARBACK-owned shell and primitive components
- review against golden-set screenshots
- no direct use of stock table, shell, card, or badge aesthetics

### 2. Scope Creep

Symptoms:
- inventory/settings/auth ideas drift back into the active web app
- redirects get replaced by real-looking unsupported surfaces
- copy implies broader product scope than backend truth allows

Counter-pressure:
- route inventory in `screen-inventory.md`
- explicit “unsupported surfaces remain redirects” rule
- product-copy audit before merge

### 3. Semantic Drift

Symptoms:
- old nouns like `session` leak back in
- UI implies per-record submit behavior
- statuses stop matching backend truth

Counter-pressure:
- typed client boundary remains source-facing
- language checks in review
- tests for review payload shape and status rendering

### 4. Fixture Drift

Symptoms:
- review harness states stop matching golden-set screens
- scenarios become ad hoc instead of canonical
- implementation gets reviewed through random local data instead of explicit screen states

Counter-pressure:
- one named scenario per approved screen
- review routes map directly to those scenarios
- scenario tests and route tests

### 5. Styling Chaos

Symptoms:
- ad hoc one-off CSS patches accumulate
- repeated visual patterns are not abstracted
- each screen solves the same spacing and surface problem differently

Counter-pressure:
- shell and primitive extraction early
- CSS modules or stable local style organization
- visual patterns graduate into primitives after second use

### 6. Silent Renegotiation

Symptoms:
- architecture changes happened, but only in code
- shared boundaries moved without any written decision
- implementation started "just doing something else" because the old plan was inconvenient

Counter-pressure:
- architecture renegotiation notes
- same-change-set doc updates
- refusal to let chat history substitute for current planning docs

## Review Gates By Phase

## Gate 0: Token Lock

Before the visible redesign starts in earnest:
- `visual-token-spec.md` is treated as the implementation contract
- dashboard-local tokens exist for the locked surface, text, and accent roles
- typography roles are mapped to the locked font system

Fail the gate if:
- color choices are still ad hoc
- typography hierarchy still comes from library defaults
- the surface ladder is not implemented as reusable tokens

## Gate A: Stack Reset

Before visual implementation starts:
- Mantine is removed from the dashboard app
- React Aria is installed for interaction primitives
- app root remains simple

Fail the gate if:
- the app still imports Mantine styles or providers
- page structure still depends on framework shell components

## Gate B: Shell Fidelity

Before list/detail feature work:
- `/` and `/reports` feel like the same BARBACK product family
- shell is dark-first
- top bar and content canvas feel deliberate
- shell matches the token contract
- screen composition follows `screen-composition-spec.md`

Fail the gate if:
- the app still reads like a starter app
- the shell still feels like a generic admin console

## Gate C: Review Harness Completeness

Before detailed state work:
- every approved screen has a stable review route
- every route maps to a named scenario
- blocked and not-found are explicit, not accidental fallbacks
- state visibility matches `state-visibility-matrix.md`
- screen block order and action placement match `screen-composition-spec.md`

Fail the gate if:
- any approved screen can only be reached by manually mutating data
- the same route shows different controls depending on convenience instead of the matrix

## Gate D: List Fidelity

Before detail refinement:
- reports list matches the approved density and tone
- empty state belongs to the same family
- list row composition no longer reads like stock table chrome

Fail the gate if:
- the list still looks like a stock data table

## Gate E: Detail Family Coherence

Before comparison/failed refinement:
- created, processing, unreviewed, and reviewed screens all feel like one product family
- shared detail shell is established
- report-level and record-level visibility rules are stable

Fail the gate if:
- each state feels like a different app
- a reviewed screen still exposes editing affordances

## Gate F: Review Interaction Truth

Before backend activation work:
- product match and fill-level controls behave correctly
- fill-level uses tenths
- submit remains report-level
- submit enablement follows the locked draft-completeness rule

Fail the gate if:
- the UI implies per-record review submission
- the fill control regresses to percentages or decimals
- incomplete drafts can submit

## Gate G: Copy And Scope Audit

Before calling the app faithful:
- no dev-process copy remains
- no unsupported feature promises remain
- no stale old-dashboard nouns remain
- review evidence exists for the changed surfaces

Fail the gate if:
- any screen still advertises features the backend does not support
- there is no screenshot-backed proof for a claimed visual pass

## Gate H: Conscious Architecture

Before any branch with shared-boundary changes is considered settled:
- architecture changes are written down
- the relevant planning docs are updated
- the implementation and docs tell the same story

Fail the gate if:
- code and docs disagree about the active architecture
- a shared boundary changed without a decision note
- implementation convenience silently replaced a locked decision

## Required Review Ritual Per Major Pass

Every substantial implementation pass should end with:

1. route check
2. golden-set visual comparison
3. semantic/copy audit
4. tests for the changed surface
5. review evidence bundle update when UI changed

## Pass Checklist

Use this checklist after every meaningful implementation step:

1. Which approved screen or screens did this pass target?
2. Which review routes should now be compared visually?
3. What new reusable primitive or component was introduced?
4. What drift risk did this pass create?
5. What test now protects the behavior?

If those questions do not have clear answers, the pass was too blurry.

## Merge Bar For UI Work

UI work should not be considered done just because:
- the route renders
- tests pass
- the app compiles

UI work is done when:
- the route renders
- tests pass
- the route is visually comparable to the approved mockup
- the semantics remain backend-truthful
- the styling approach did not add new drift
- the pass leaves behind durable review evidence

## Recommendation For Implementation Rhythm

The safest rhythm is:

1. change one screen family
2. verify with review route
3. compare against golden set
4. add or update tests
5. only then move to the next screen family

That rhythm is slower than freeform hacking for one day and faster than untangling drift for two weeks.
