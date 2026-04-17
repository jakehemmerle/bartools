# Q2: Tier 2 Evaluation Strategy — Detection + Identification Pipeline

**Date:** 2026-04-15
**Status:** Research (not yet implemented — Tier 2 is post-MVP)

---

## Problem

Tier 2 adds an on-device detection model (RF-DETR Nano) in front of the existing cloud VLM identification. The pipeline becomes: camera frame → on-device detection → crop → cloud VLM → bottle ID. We need an eval strategy that covers both models and their interaction, without fragmenting observability across disconnected tools.

## Candidates

| Option | Detection Training | Detection Validation | Pipeline E2E | VLM Identification |
|---|---|---|---|---|
| **A: LangSmith only** | Forced fit — no CV training support | Possible via custom datasets | Native | Already done |
| **B: Roboflow + W&B only** | Native | Native | No LLM trace support | Would need separate setup |
| **C: Roboflow (training) + LangSmith (pipeline)** | Native | Bridged via LangSmith custom dataset | Native — single trace per pipeline run | Already done |
| **D: W&B (training) + LangSmith (pipeline)** | Native | Same bridge pattern | Same | Already done |

## Recommendation: Option C — Roboflow + LangSmith

### Roboflow handles detection model lifecycle

- **Labeling** — SAM-2 assisted bounding box annotation, COCO JSON export
- **Training** — RF-DETR Nano fine-tuning (can train directly on Roboflow platform or export for local/cloud GPU training)
- **Training metrics** — mAP@50, mAP@50-95, precision, recall, loss curves, confusion matrix per epoch
- **Dataset versioning** — tracks dataset splits, augmentation configs, and model versions
- **Model hosting** — optional; we export to ExecuTorch .pte instead
- **Cost** — free tier sufficient for single-class detector with <10K images

Roboflow is the natural fit because:
1. The RF-DETR research doc already recommends it for labeling
2. Roboflow developed RF-DETR — seamless integration
3. Training metrics (mAP, P/R curves) are first-class in Roboflow's UI
4. LangSmith has no equivalent for CV training metrics

### LangSmith handles inference-time pipeline observability

The existing `bartools` LangSmith project adds a new dataset and evaluator set for the Tier 2 pipeline.

**New dataset: `verbena-detection-pipeline`**
- Each example: a shelf/multi-bottle photo (Tier 2 input)
- Ground truth: list of bottles with bounding boxes + names + fill levels
- Larger than the current `verbena-simple` dataset (9 photos) — needs 50+ shelf photos

**Pipeline trace structure (single LangSmith trace per photo):**

```
Root: pipeline_eval (shelf photo input)
├── Span: detection
│   ├── model: rfdetr-nano-v1
│   ├── input: shelf photo (base64 or URL)
│   ├── output: [{bbox, confidence, class}]
│   ├── latency_ms: 85
│   └── metadata: {device, quantization, fps_setting}
├── Span: crop_and_upload (per detected bottle)
│   ├── input: bbox coordinates
│   ├── output: cropped image URL
│   ├── quality_gates: {confidence: 0.94, centered: true, blur_score: 142}
│   └── latency_ms: 12
└── Span: vlm_identification (per cropped bottle)
    ├── model: claude-sonnet-4-6
    ├── input: cropped bottle image
    ├── output: {name, category, fill_percent}
    ├── latency_ms: 1200
    └── metadata: {prompt_version, token_count}
```

**New evaluators:**

```typescript
// Detection evaluators (run on the detection span output)
export const detectionRecall = async ({ outputs, referenceOutputs }) => {
  // What fraction of ground-truth bottles were detected?
  // Match by IoU > 0.5 between predicted and ground-truth bboxes
}

export const detectionPrecision = async ({ outputs, referenceOutputs }) => {
  // What fraction of detections were real bottles (not false positives)?
}

export const detectionIoU = async ({ outputs, referenceOutputs }) => {
  // Average IoU of matched detections
}

// Pipeline evaluators (run on the full trace output)
export const pipelineNameAccuracy = async ({ outputs, referenceOutputs }) => {
  // End-to-end: did the full pipeline correctly identify each bottle?
  // This captures failures from detection, cropping, AND identification
}

export const pipelineBottleCount = async ({ outputs, referenceOutputs }) => {
  // Did the pipeline find the right number of bottles?
}
```

**Existing evaluators unchanged:**
- `nameCorrect`, `volumeAbsErr`, `nameAccSummary`, `volumeMaeSummary` continue to work for Tier 1 (direct photo → VLM) evals on the `verbena-simple` dataset

### Single dashboard, two datasets

The `bartools` LangSmith project shows:

| Dataset | What it measures | When to run |
|---|---|---|
| `verbena-simple` | Tier 1: single-bottle photo → VLM accuracy | Every VLM prompt/model change |
| `verbena-detection-pipeline` | Tier 2: shelf photo → detection → crop → VLM accuracy | Every detection model retrain, VLM change, or quality gate tuning |

Both visible in the same project. You can compare experiments across datasets to see if Tier 2's pipeline accuracy approaches Tier 1's direct-photo accuracy (it should be close if detection + cropping are good).

### Bridge: detection validation in LangSmith

For detection-specific validation without the full pipeline, log detection results to LangSmith as a lightweight dataset:

```typescript
// Run RF-DETR on validation images, log results to LangSmith
for (const image of validationSet) {
  const detections = await runDetection(image)
  await langsmith.logRun({
    name: 'detection_validation',
    inputs: { image_url: image.url },
    outputs: { detections },
    reference_outputs: { ground_truth_bboxes: image.labels },
  })
}
```

This lets you track detection mAP trends over time in LangSmith without needing to run the full VLM pipeline. But for training-loop metrics (loss curves, per-epoch mAP), Roboflow remains the source of truth.

---

## What this does NOT cover

- **On-device performance profiling** (thermal, battery, FPS) — use Xcode Instruments / Android Profiler
- **A/B testing detection models on-device** — use Firebase ML / EAS Update for model delivery
- **User correction feedback loop** — the review screen captures corrections that could feed back into detection model training data; this is a separate data pipeline concern

---

## Cost

| Tool | Tier | Cost |
|---|---|---|
| Roboflow | Free | 10K images, 3 model versions, public projects |
| LangSmith | Developer (free) | 5K traces/month, 1 project |
| LangSmith | Plus ($39/seat/mo) | Unlimited traces, multiple projects | 

Free tiers are sufficient for the capstone. Upgrade LangSmith if trace volume exceeds 5K/month (unlikely during development).

---

## Implementation sequence (when Tier 2 starts)

1. Label 500+ bottle images in Roboflow
2. Train RF-DETR Nano, validate mAP@50 > 90% in Roboflow dashboard
3. Export .pte model, integrate with react-native-executorch
4. Create `verbena-detection-pipeline` dataset in LangSmith with shelf photos
5. Add detection + pipeline evaluators to `packages/eval/`
6. Run pipeline evals, compare against Tier 1 baseline
