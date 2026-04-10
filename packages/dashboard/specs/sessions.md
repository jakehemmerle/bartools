# Sessions Spec

## Purpose

Let users review completed inventory sessions and inspect what was saved.

Dates and times in session history and session detail should use the bar's local timezone.

## In Scope

- Session history list
- Session detail page
- Display of final saved bottle data
- Display of thumbnails when available

## Out Of Scope

- Re-opening sessions for editing
- Diffing two sessions
- Session approval workflows

## User Stories

- As a manager, I want to see recent inventory sessions
- As a manager, I want to know who ran a session and when
- As a manager, I want to inspect the final records saved from a session

## Session History

### Required Fields

- Session id
- Created or completed timestamp
- User name or identifier
- Bottle count
- Session status if more than one final status exists

### Page Actions

- Sort by newest first
- Open session detail

### Pagination

- MVP does not include pagination
- Session history should load as a single list for now
- Pagination can be introduced after MVP if real usage and dataset size require it

## Session Detail

### Required Data

- Session metadata
- List of confirmed bottle records
- Thumbnail per bottle
- Final saved fill percent
- Final saved identity fields such as bottle name and type
- Relevant `as of` or session timestamps where needed, without a separate page-level freshness indicator

### Correction Comparison Behavior

- Session detail does not require correction-history data to be considered MVP-complete
- If original model output and corrected values are available, session detail should show that comparison
- Notes about user corrections are optional and do not block MVP completeness

## Visual Direction

- Session history should feel archival and easy to scan
- Session detail should make thumbnails and confirmed data easy to compare without resorting to oversized cards

## Empty State

- Explain that no inventory sessions have been completed yet
- Keep the tone calm and operational

## Missing Media Behavior

- If a thumbnail image is missing or expired, session detail should show a graceful placeholder
- Missing media must not break or block the rest of the session detail view

## Acceptance Criteria

- Users can review sessions in reverse chronological order
- Users can open a session and understand the final saved results
- Session detail supports thumbnail display for confirmed records, with graceful placeholders when images are missing or expired
- Session detail is useful even if correction history is not yet available
- If original-versus-corrected comparison data is exposed, the page displays it without making it a hard MVP dependency
- Session history and detail remain usable on desktop, tablet, and phone-sized web layouts
- Session history and detail support keyboard navigation and accessible labels for primary actions and media
