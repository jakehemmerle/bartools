# Presearch Criteria — Required Questions

**Project:** BarBack
**Date:** 2026-04-09

---

## Phase 1: Define Your Constraints

### 1. Domain Selection
- **Domain:** Bar/restaurant inventory management
- **Use cases:** Photograph liquor bottles → VLM identification → inventory tracking → reorder alerts → spreadsheet export
- **Verification:** Human-in-the-loop correction of VLM results before confirming inventory
- **Data sources:** Phone camera, photo library, Gemini 2.5 Flash API, UPC/GTIN-12 databases (Patrick researching)

*Status: ✅ Answered*

---

### 2. Scale & Performance
- **Query volume:** Free tier start (250 req/day Gemini). Typical bar: 100-200 bottles per session, orders 2x/week
- **Latency:** Progressive results via SSE — each bottle result as it arrives, not waiting for full batch
- **Concurrent users:** Low for MVP (handful of bars testing). No hard concurrency target yet.
- **Cost constraints:** Gemini free tier initially; paid tier is $0.30/1M input tokens. Hosting must be free/low-cost.

*Status: ✅ Answered*

---

### 3. Reliability Requirements
- **Cost of wrong answer:** Low-medium. User reviews and corrects VLM output before confirming. Worst case: wrong bottle identified → user fixes it manually.
- **Non-negotiable verification:** User must review every VLM result before it's persisted.
- **Human-in-the-loop:** Yes — the review ScrollView with editable fields + fill slider IS the HITL step.
- **Audit/compliance:** None for MVP.

*Status: ✅ Answered*

---

### 4. Team & Skill Constraints
- **Ray:** 4+ years React Native/Expo — building mobile app
- **Jacob:** Backend, VLM/image processing, GTM strategy
- **Patrick:** Bottle DB/UPC research, web management dashboard (potentially post-MVP)
- **Agent frameworks:** Not using agent frameworks — direct Gemini API calls
- **Eval/testing:** TBD

*Status: ✅ Answered*

---

## Phase 2: Architecture Discovery

### 5. Agent Framework Selection
- **Not applicable.** This is not an agent system — it's a direct VLM API call per image.
- **Architecture:** Mobile app → Hono backend → Gemini API → structured JSON response → SSE back to client
- **State management:** Server-side inventory persistence. Mobile app holds batch state during capture/review.

*Status: ✅ Answered (N/A reframed as VLM pipeline)*

---

### 6. LLM Selection
- **Choice:** Gemini 2.5 Flash (free tier to start)
- **Function calling:** Not needed — structured JSON output via `response_mime_type: application/json`
- **Context window:** 1M tokens (more than sufficient for single image + prompt)
- **Cost:** Free tier: 250 req/day, 10 RPM. Paid: $0.30/1M input, $2.50/1M output.
- **Upgrade path:** Expand to paid tier or evaluate alternatives based on testing findings.

*Status: ✅ Answered*

---

### 7. Tool Design
- **Backend endpoints needed:**
  - POST `/batch` — upload batch of images
  - GET `/batch/:id/stream` — SSE stream of results
  - POST `/batch/:id/confirm` — persist confirmed/corrected results
  - GET `/inventory` — current inventory snapshot
  - GET `/inventory/alerts` — reorder alerts
  - GET `/inventory/export` — spreadsheet export
- **External APIs:** Gemini 2.5 Flash
- **Mock vs real:** Mock Gemini responses for mobile development; real for integration testing
- **Error handling per tool:** TBD (team decision with Jacob)

*Status: ⚠️ Partial — endpoint design is draft, error handling TBD*

---

### 8. Observability Strategy
- **Not prioritized for MVP.** Basic request logging on backend.
- **Metrics that matter:** VLM accuracy (% of bottles correctly identified without user correction), batch processing time
- **Cost tracking:** Monitor Gemini API usage against free tier limits

*Status: ⚠️ Partial — deferred, basic logging only*

---

### 9. Eval Approach
- **Correctness measure:** % of bottles where user accepts VLM result without edits
- **Ground truth:** Manual — compare VLM output to actual bottle during testing
- **Automated vs human:** Human for now; automated eval is stretch
- **CI integration:** None for MVP

*Status: ⚠️ Partial — informal measurement only*

---

### 10. Verification Design
- **What claims must be verified:** Bottle brand, release/type, vintage, fill level
- **Fact-checking:** User reviews every result (HITL)
- **Confidence thresholds:** Not implemented for MVP — every result goes to user review
- **Escalation:** N/A — user IS the escalation

*Status: ✅ Answered*

---

## Phase 3: Post-Stack Refinement

### 11. Failure Mode Analysis
- **Gemini API fails:** Show error state per bottle in ScrollView, allow retry
- **Ambiguous/unrecognizable bottle:** Return low-confidence result, user fills in manually
- **Rate limiting:** Queue batch processing to stay within 10 RPM
- **Graceful degradation:** App should remain usable for manual data entry if VLM is down

*Status: ⚠️ Partial — needs detail from Jacob*

---

### 12. Security Considerations
- **Prompt injection:** Low risk — user doesn't craft prompts, images are the input
- **Data leakage:** Bottle images sent to Google's Gemini API — acceptable for bar inventory
- **API key management:** Gemini key on backend only, never exposed to mobile app
- **Audit logging:** None for MVP

*Status: ⚠️ Partial — basics covered, no formal security review*

---

### 13. Testing Strategy
- **Unit tests:** TDD per CLAUDE.md — Bun test runner
- **Integration tests:** Backend + Gemini API with real/mock responses
- **Adversarial testing:** Edge cases: obscure bottles, damaged labels, empty bottles, multiple bottles in frame (Tier 1 should reject or handle gracefully)
- **Regression:** TBD

*Status: ⚠️ Partial — TDD mandated but strategy details TBD*

---

### 14. Open Source Planning
- **Per init_research_notes.md:** Mobile app is the open-source/free component. Revenue from integrations.
- **Licensing:** TBD
- **Documentation:** TBD
- **Community:** Not a priority for MVP

*Status: ⚠️ Partial — business model clear, execution details TBD*

---

### 15. Deployment & Operations
- **Hosting:** Free/low-cost, must support custom domain. Candidates: Fly.io, Railway, Render (team decision with Jacob)
- **CI/CD:** TBD
- **Monitoring:** Basic logging
- **Rollback:** TBD

*Status: ⚠️ Partial — deferred to team*

---

### 16. Iteration Planning
- **User feedback:** Direct from test bars (field research contacts: Lavaca, Iron Bear, others from bar_notes.md)
- **Eval-driven improvement:** Track VLM accuracy over time, tune prompts
- **Feature prioritization:** Tier 1 → Tier 2 → Tier 3 capture. MVP viz → stretch viz.
- **Maintenance:** TBD

*Status: ⚠️ Partial — feedback channels identified, process TBD*

---

## Completion Check
- [x] 6/16 fully answered
- [ ] 10/16 partially answered (mostly deferred to team or post-MVP)
- [ ] 0/16 unanswered
