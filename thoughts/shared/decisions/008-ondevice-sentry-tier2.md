# ADR-008: On-Device Detection Sentry Deferred to Tier 2

**Date:** 2026-04-13
**Status:** Accepted
**Deciders:** Ray

## Context

Two deep-research documents explored on-device bottle detection via camera frame processors:
1. YOLO26n — rejected due to AGPL-3.0 dual licensing (requires open-sourcing app or enterprise license)
2. RF-DETR Nano (Apache 2.0) — selected as the detection model for Tier 2

The sentry pattern: RF-DETR Nano runs on-device at 5 FPS via react-native-executorch, detects bottles in camera feed, applies quality gates (confidence, centering, blur, temporal lock, dedup, face detection), crops best frame, sends to cloud VLM for identification.

## Decision

**Defer the on-device sentry to Tier 2 (post-MVP).** Tier 1 MVP uses manual photo capture — user frames and takes the photo. The sentry adds UX polish for Tier 1 but is load-bearing only for Tier 2 (multi-bottle shelf detection) and Tier 3 (video).

## Rationale

- Tier 1 doesn't need auto-detection — user is already doing the framing
- Sentry adds 8 weeks of scope: labeled dataset (500+ images), model training, ExecuTorch export, frame processor integration, thermal/battery management, NPU validation, privacy filter
- RF-DETR Nano's 30.5M params and 50-100ms inference fit the 5 FPS budget but bring RAM/thermal concerns that need real-device profiling
- Keeping it out of MVP preserves team velocity on core features

## Consequences

- Tier 1 capture is simpler: take photo → upload → VLM identifies
- RF-DETR Nano research is preserved in `thoughts/shared/research/references/deep-research-rfdetr-nano-mobile.md`
- When Tier 2 starts, the architecture is documented and ready
- YOLO26 is permanently excluded (AGPL-3.0); RF-DETR Nano (Apache 2.0) is the chosen detector
