"""Scorer protocol + default impl.

Scoring is a harvester-level concern (BestCropHarvester calls it to pick a
winner per track ID). The pipeline itself does not score. New Scorer impls
(sharpness-only, mask-area-only, model-feature-based, etc.) drop in here.
"""
from __future__ import annotations

from typing import Protocol

import cv2
import numpy as np

from detections import Detection


class Scorer(Protocol):
    def score(self, det: Detection, frame_hw: tuple[int, int]) -> float: ...
    def breakdown(self, det: Detection, frame_hw: tuple[int, int]) -> dict: ...


class SharpnessConfidenceCenteredScorer:
    """Default scorer: score = conf × sharpness_norm × centeredness × mask_area_norm."""

    def breakdown(self, det: Detection, frame_hw: tuple[int, int]) -> dict:
        crop = det.crop
        if crop.size == 0:
            return {"score": 0.0, "sharpness": 0.0, "centeredness": 0.0, "mask_area_norm": 0.0}
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY) if crop.ndim == 3 else crop
        sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        sharpness_norm = min(sharpness / 500.0, 1.0)

        H, W = frame_hw
        x1, y1, x2, y2 = det.xyxy
        edge_margin = 8
        touching_edge = (
            x1 <= edge_margin or y1 <= edge_margin
            or x2 >= W - edge_margin or y2 >= H - edge_margin
        )
        centeredness = 0.3 if touching_edge else 1.0
        mask_area_norm = min(det.mask_px / (H * W * 0.05), 1.0)
        score = det.conf * sharpness_norm * centeredness * mask_area_norm
        return {
            "score": score,
            "sharpness": sharpness,
            "centeredness": centeredness,
            "mask_area_norm": mask_area_norm,
        }

    def score(self, det: Detection, frame_hw: tuple[int, int]) -> float:
        return self.breakdown(det, frame_hw)["score"]


def score_detection(
    conf: float,
    crop: np.ndarray,
    bbox: tuple[int, int, int, int],
    mask_px: int,
    frame_hw: tuple[int, int],
) -> tuple[float, float, float, float]:
    """Legacy 4-tuple signature kept for bench.py stage-timing parity."""
    det = Detection(
        tid=0, xyxy=bbox, conf=conf, crop=crop,
        mask_crop=np.empty(0, dtype=bool), mask_px=mask_px,
    )
    b = SharpnessConfidenceCenteredScorer().breakdown(det, frame_hw)
    return b["score"], b["sharpness"], b["centeredness"], b["mask_area_norm"]
