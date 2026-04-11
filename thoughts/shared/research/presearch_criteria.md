# Presearch Criteria — Required Questions

**Project:** BarBack
**Date:** 2026-04-10

---

## Phase 1: Define Your Constraints

### 1. Domain Selection
- **Domain:** Bar/restaurant inventory management
- **Use cases:** Photograph liquor bottles → VLM identification → inventory tracking per venue/location → PAR-based low-stock alerts → CSV export → dashboard review
- **Verification:** Human-in-the-loop correction of VLM results before confirming inventory. Corrections double as SME-annotated training data (compare `vlmFillTenths` on scan vs `fillLevelTenths` on confirmed inventory).
- **Data sources:** Phone camera, photo library, VLM API, UPC/GTIN-12 databases (Patrick researching), Verbena real-world bar data as fixture/eval ground truth

*Status: ✅ Answered*

---

### 2. Scale & Performance
- **Query volume:** Verbena has ~397 products. Typical bar: 100-200 bottles per session, orders 2x/week. Eval harness runs single-concurrency.
- **Latency:** Progressive results via SSE — each bottle result as it arrives, not waiting for full batch
- **Concurrent users:** Low for MVP (handful of bars testing). No hard concurrency target yet.
- **Cost constraints:** VLM model TBD — eval harness uses Claude Sonnet 4.6 (Anthropic API pricing), Gemini 2.5 Flash free tier also researched. Hosting must be free/low-cost with custom domain support.

*Status: ✅ Answered*

---

### 3. Reliability Requirements
- **Cost of wrong answer:** Low-medium. User reviews and corrects VLM output before confirming. Worst case: wrong bottle identified → user fixes it manually.
- **Non-negotiable verification:** User must review every VLM result before it's persisted. Only confirmed session data may influence inventory rows (enforced by dashboard specs).
- **Human-in-the-loop:** Yes — the review ScrollView with editable fields + fill slider IS the HITL step.
- **Audit/compliance:** None for MVP. Session history provides implicit audit trail.

*Status: ✅ Answered*

---

### 4. Team & Skill Constraints
- **Ray:** 4+ years React Native/Expo — building mobile app
- **Jacob:** Backend (Hono+Bun), VLM/image processing, eval harness (Claude Agent SDK + LangSmith), GTM strategy
- **Patrick:** Bottle DB/UPC research, web dashboard (Mantine/React), implementation plan and specs authored
- **Frameworks in use:** Claude Agent SDK for eval, Drizzle ORM, Mantine UI, Expo Router

*Status: ✅ Answered*

---

## Phase 2: Architecture Discovery

### 5. Agent Framework Selection
- **Eval harness:** Claude Agent SDK with MCP server pattern (tool-use loop with `submit_answer` tool, validation, retry up to MAX_ATTEMPTS=4)
- **Production architecture:** Mobile app → Hono backend → VLM API → structured response → SSE back to client
- **State management:** Server-side inventory in PostgreSQL. Mobile app holds batch state during capture/review. Dashboard uses fixture-driven development until backend APIs are ready.

*Status: ✅ Answered*

---

### 6. LLM/VLM Selection
- **Choice:** Claude Sonnet 4.6 (`claude-sonnet-4-6`) via Agent SDK — leverages existing Claude Code subscription instead of separate API costs
- **Fallback:** Gemini 2.5 Flash researched (free tier: 250 req/day, 10 RPM; paid: $0.30/1M input). Pivot if Claude doesn't meet accuracy/cost needs.
- **Swappable:** `DEFAULT_MODEL` in `packages/eval/src/types.ts` makes model changes trivial.
- **Output format:** Structured — bottle name (verbatim from catalog), fill volume (0.0-1.0 in 0.1 steps)
- **Context:** 9 hand-labeled Verbena photos as ground truth. Evaluators: name accuracy + volume MAE.

*Status: ✅ Answered — Claude Sonnet 4.6, with Gemini as fallback*

---

### 7. Tool Design
- **Backend endpoints (from dashboard data contracts):**
  - Auth: sign in, sign up, user info
  - Venues: create/join venue, member management, invite links
  - Inventory: product-level rows with PAR status, search, filter, sort, low-stock filter
  - Sessions: list, detail by ID (with bottle records, thumbnails, correction metadata)
  - Export: CSV (client-side in MVP, backend endpoint stretch)
  - Settings: venue timezone, default PAR, per-product PAR overrides
  - Scan pipeline: POST batch images, GET SSE stream, POST confirm
- **External APIs:** VLM (Claude or Gemini), UPC lookup (TBD)
- **Mock vs real:** Dashboard uses fixture builders (`packages/dashboard/src/lib/fixtures/`). Eval harness uses real VLM calls against labeled photos.
- **Error handling:** Eval harness retries up to 4 attempts on invalid name/volume. Backend error handling TBD.

*Status: ✅ Answered (MVP endpoints defined via dashboard specs and data contracts)*

---

### 8. Observability Strategy
- **Eval tracking:** LangSmith — dataset sync, experiment runs, per-row traces with `trace_id`
- **Metrics:** Name accuracy (% correct), Volume MAE (mean absolute error), per-scan latency, confidence scores stored in `scans.rawResponse`
- **Cost tracking:** Per-model via LangSmith experiments
- **Production:** Basic logging. LangSmith project `bartools` configured in `.env.example`.

*Status: ✅ Answered (eval observability established, production observability basic)*

---

### 9. Eval Approach
- **Harness:** `packages/eval/` — sends photos to VLM via Agent SDK, scores against hand-labeled ground truth
- **Ground truth:** `assets/verbena_simple_solutions.jsonl` — 9 labeled photos (name + volume)
- **Evaluators:** `nameCorrect` (exact string match), `volumeAbsErr` (absolute error). Summary: `nameAccSummary`, `volumeMaeSummary`.
- **Dataset:** LangSmith dataset `verbena-simple`, auto-synced from solutions file
- **CI integration:** Not yet, but `bun test` runs unit tests without network

*Status: ✅ Answered*

---

### 10. Verification Design
- **What claims must be verified:** Bottle name (verbatim from catalog), category, fill level, UPC
- **Fact-checking:** User reviews every result (HITL). Dashboard shows both original model output and corrected values (`SessionBottleRecord.originalModelOutput` + `correctedValues`).
- **Confidence thresholds:** `confidenceScore` stored per scan (0.000-1.000). Not used for gating in MVP — every result goes to user review.
- **Escalation:** User IS the escalation. Unrecognized bottles get `bottleId: null` on the scan.

*Status: ✅ Answered*

---

## Phase 3: Post-Stack Refinement

### 11. Failure Mode Analysis
- **VLM fails:** Eval harness handles: retry up to 4 attempts, surface error in predictions. Mobile should show error state per bottle in ScrollView, allow retry.
- **Unrecognized bottle:** `bottleId: null` on scan, user fills in manually
- **Rate limiting:** Queue batch processing (Gemini: 10 RPM free tier; Claude: API rate limits apply)
- **Graceful degradation:** App should remain usable for manual data entry if VLM is down. Dashboard works with fixture data when backend is unavailable.

*Status: ⚠️ Partial — eval handles failures, production error handling TBD with Jacob*

---

### 12. Security Considerations
- **Prompt injection:** Low risk — user doesn't craft prompts, images are the input. Eval harness constrains output via tool schema validation.
- **Data leakage:** Bottle images sent to VLM API (Anthropic or Google). Acceptable for bar inventory.
- **API key management:** Keys in `.env` (gitignored). `CLAUDE_CODE_OAUTH_TOKEN`, `LANGSMITH_API_KEY` required for eval. Gemini key on backend only if used.
- **Auth:** Seeded username/password for initial dev. Dashboard specs include sign up, sign in, venue membership.
- **Audit logging:** Session history provides implicit audit. Raw VLM responses stored per scan.

*Status: ⚠️ Partial — basics covered, no formal security review*

---

### 13. Testing Strategy
- **Eval tests:** `packages/eval/` — unit tests for validation, bottle loading, evaluators, seeding (`bun test`, no network)
- **Dashboard tests:** Router, page, and lib tests using Vitest + React Testing Library (`packages/dashboard/src/test/`)
- **Integration tests:** Eval harness is effectively an integration test (VLM + tool-use loop + scoring)
- **TDD:** Mandated per CLAUDE.md (red → green → refactor)
- **Testing strategy doc:** `packages/dashboard/coordination/testing-strategy.md` covers dashboard testing approach

*Status: ✅ Answered*

---

### 14. Open Source Planning
- **Per init_research_notes.md:** Mobile app is the open-source/free component. Revenue from integrations.
- **Licensing:** TBD. ODbL considerations if using Open Food Facts data (see deep research report).
- **Documentation:** Dashboard specs and coordination docs are thorough.
- **Community:** Not a priority for MVP.

*Status: ⚠️ Partial — business model clear, licensing details TBD*

---

### 15. Deployment & Operations
- **Database:** PostgreSQL 16 Alpine via docker-compose (local dev). Production hosting TBD.
- **Backend:** Hono + Bun. Drizzle ORM with `drizzle.config.ts` configured for Postgres.
- **Dashboard:** Vite + React + Mantine. Deployment target TBD.
- **Mobile:** Expo (EAS Build likely for distribution). Deployment target TBD.
- **Hosting:** Must be free/low-cost with custom domain. Candidates: Fly.io, Railway, Render.
- **CI/CD:** Not configured yet.

*Status: ⚠️ Partial — local dev established, production deployment TBD*

---

### 16. Iteration Planning
- **Eval-driven improvement:** LangSmith experiments track model performance over time. Swap `DEFAULT_MODEL` to compare models. Ground truth expanding (9 photos labeled so far).
- **User feedback:** Direct from test bars (Verbena data already ingested, field research contacts from bar_notes).
- **Feature prioritization:** Tier 1 → Tier 2 → Tier 3 capture. MVP viz → stretch viz.
- **Dashboard roadmap:** 10-phase implementation plan in `packages/dashboard/coordination/` with execution backlog and ticket breakdown.

*Status: ✅ Answered*

---

## Completion Check
- [x] 13/16 fully answered
- [ ] 3/16 partially answered (failure handling, security, deployment)
- [ ] 0/16 unanswered
