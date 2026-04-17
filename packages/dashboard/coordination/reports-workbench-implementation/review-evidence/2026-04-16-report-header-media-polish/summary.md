# Summary

This pass tightened two remaining desktop mismatches against the approved workbench screens:

1. Reviewed detail now behaves like a true product header.
   - The status chip renders before the title in stacked detail headers.
   - Report headings now preserve the full backend report ID instead of truncating after eight characters.
   - The reviewed summary shell uses a two-column desktop layout so the title block and right-aligned metadata feel closer to the approved composition.

2. Failed detail now reads as calm recovery work instead of placeholder scaffolding.
   - The failed media slab is narrower and shorter on desktop.
   - Fixture media no longer points at the favicon; it now uses dedicated bottle-art stand-ins that better match the intended tone.
   - One explicit no-image state remains for the corrupted-media case.

# Validation

- `bun --filter @bartools/dashboard lint`
- `bun --filter @bartools/dashboard typecheck`
- `bun --filter @bartools/dashboard test`
- `bun --filter @bartools/dashboard build`

All four commands passed on April 16, 2026.

# Browser Check

- Reviewed route captured from `http://127.0.0.1:5173/__review/report/reviewed`
- Failed route captured from `http://127.0.0.1:5173/__review/report/failed`
- Reviewed and failed routes also captured at `390x844` to verify mobile wrapping after the full-ID heading change
- `agent-browser errors` returned no page errors
- Console output was limited to expected Vite dev connection logs and the React DevTools informational message

# Remaining Minor Drift

- The reviewed title still wraps across two lines for long UUID-backed report IDs. This is acceptable, but the final implementation may want a slightly more deliberate line-break treatment if design wants even tighter parity.
- Failed records are materially calmer now, but the final backend-fed media will matter more than fixture art for the last mile of polish.
