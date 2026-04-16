# Stitch Handoff Selection

This document identifies the canonical mockups and locked design choices for the BARBACK web reports workbench handoff.

## Canonical Screen Winners

### Entry And List
- Entry surface: {{DATA:SCREEN:SCREEN_27}}
- Reports list: {{DATA:SCREEN:SCREEN_22}}
- Reports list empty state: {{DATA:SCREEN:SCREEN_20}}
- Blocked state: {{DATA:SCREEN:SCREEN_29}}
- Not found state: {{DATA:SCREEN:SCREEN_24}}

### Detail States
- Created: {{DATA:SCREEN:SCREEN_11}}
- Processing: {{DATA:SCREEN:SCREEN_28}}
- Unreviewed: {{DATA:SCREEN:SCREEN_30}}
- Reviewed: {{DATA:SCREEN:SCREEN_15}}
- Comparison emphasis: {{DATA:SCREEN:SCREEN_12}} (to be updated)
- Failed emphasis: {{DATA:SCREEN:SCREEN_6}} (to be updated)

## Locked Design Decisions
- **Product Framing**: Narrow reports workbench, not a general dashboard.
- **Vocabulary**: Use `report` and `record`. No `inventory report` or `variance`.
- **Visual Tone**: Dark-first, mobile-derived typography (Newsreader, Manrope, Space Grotesk).
- **Review Controls**: Fill level in tenths (0-10) only. No percentages or decimals.
- **Failure/Comparison**: Clear distinction between original and corrected data. Operational, not catastrophic.
