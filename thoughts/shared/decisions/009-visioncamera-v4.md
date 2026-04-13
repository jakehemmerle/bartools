# ADR-009: VisionCamera v4 (Reverses d007)

**Date:** 2026-04-13
**Status:** Accepted (supersedes d007)
**Deciders:** Ray

## Context

Decision d007 (2026-04-11) chose react-native-vision-camera v5 to "set up Frame Processor pipeline for Tier 2/3 without a future rewrite." However:
- v5 is sponsor-gated ($20/mo GitHub sponsorship for source access)
- v5 uses Nitro Modules (beta, 5.0.0-beta.1 through beta.8)
- On-device sentry is now deferred to Tier 2 (ADR-008)

VisionCamera v4.7.3 is MIT-licensed, stable, 340K weekly npm downloads.

## Decision

**Use react-native-vision-camera v4.7.3** for Tier 1 MVP. Reassess v5 when Tier 2 sentry work begins.

## Rationale

- Tier 1 only needs photo capture, not frame processors
- v4 is free, stable, and well-documented
- v5's `runOnFrame` worklets are only needed for the sentry pattern (Tier 2)
- Avoids sponsor-gated dependency for MVP
- Migration path from v4 → v5 is documented in the RF-DETR research doc (camera interaction layer swap only)

## Consequences

- Simpler camera setup for Tier 1
- No sponsor dependency
- When Tier 2 starts, may need v4 → v5 migration (or use v4's `runAsync` + vision-camera-cropper as the RF-DETR doc describes)
