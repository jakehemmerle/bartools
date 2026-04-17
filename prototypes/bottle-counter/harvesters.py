"""Pluggable crop-collection strategies.

- BestCropHarvester: score every detection, keep one winner per track ID.
  Output: flat list of images (one per unique bottle).

- AllCropsHarvester: no scoring, bin every crop by track ID.
  Output: folder per unique bottle, containing every frame crop.
  Handoff format for downstream classification / de-dup / selection.
"""
from __future__ import annotations

import json
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

import cv2
import numpy as np

from detections import Detection, TrackedFrame
from scoring import Scorer, SharpnessConfidenceCenteredScorer


class Harvester(Protocol):
    name: str

    def on_detection(self, tf: TrackedFrame, det: Detection) -> None: ...
    def finalize(self, kept_tids: set[int], frame_counts: dict[int, int]) -> None: ...
    def summary(self) -> dict: ...


@dataclass
class _BestRecord:
    score: float
    sharpness: float
    centeredness: float
    mask_area_norm: float
    conf: float
    frame_idx: int
    timestamp_s: float
    bbox: tuple[int, int, int, int]
    crop_rel: str = ""
    mask_rel: str = ""


class BestCropHarvester:
    name = "best"

    def __init__(self, out_dir: Path, scorer: Scorer | None = None) -> None:
        self.out_dir = Path(out_dir)
        self.crops_dir = self.out_dir / "crops"
        self.masks_dir = self.out_dir / "masks"
        self.crops_dir.mkdir(parents=True, exist_ok=True)
        self.masks_dir.mkdir(parents=True, exist_ok=True)
        self.scorer = scorer or SharpnessConfidenceCenteredScorer()
        self._best: dict[int, _BestRecord] = {}
        self._summary: dict | None = None

    def on_detection(self, tf: TrackedFrame, det: Detection) -> None:
        b = self.scorer.breakdown(det, (tf.H, tf.W))
        prev = self._best.get(det.tid)
        if prev is not None and b["score"] <= prev.score:
            return

        crop_path = self.crops_dir / f"bottle_{det.tid:03d}.jpg"
        mask_path = self.masks_dir / f"bottle_{det.tid:03d}.png"
        cv2.imwrite(str(crop_path), det.crop)
        cv2.imwrite(str(mask_path), (det.mask_crop.astype(np.uint8)) * 255)

        self._best[det.tid] = _BestRecord(
            score=b["score"],
            sharpness=b["sharpness"],
            centeredness=b["centeredness"],
            mask_area_norm=b["mask_area_norm"],
            conf=det.conf,
            frame_idx=tf.frame_idx,
            timestamp_s=tf.timestamp_s,
            bbox=det.xyxy,
            crop_rel=str(crop_path.relative_to(self.out_dir)),
            mask_rel=str(mask_path.relative_to(self.out_dir)),
        )

    def finalize(self, kept_tids: set[int], frame_counts: dict[int, int]) -> None:
        for tid, rec in list(self._best.items()):
            if tid not in kept_tids:
                (self.out_dir / rec.crop_rel).unlink(missing_ok=True)
                (self.out_dir / rec.mask_rel).unlink(missing_ok=True)
                del self._best[tid]

        bottles = [
            {
                "track_id": tid,
                "score": round(r.score, 4),
                "conf": round(r.conf, 3),
                "sharpness": round(r.sharpness, 1),
                "centeredness": r.centeredness,
                "mask_area_norm": round(r.mask_area_norm, 3),
                "best_frame_idx": r.frame_idx,
                "best_timestamp_s": round(r.timestamp_s, 2),
                "bbox_xyxy": list(r.bbox),
                "frames_seen": frame_counts.get(tid, 0),
                "crop": r.crop_rel,
                "mask": r.mask_rel,
            }
            for tid, r in sorted(self._best.items())
        ]
        self._summary = {"bottles": bottles}
        (self.out_dir / "summary.json").write_text(json.dumps(self._summary, indent=2))

    def summary(self) -> dict:
        return self._summary or {"bottles": []}


class AllCropsHarvester:
    name = "all"

    def __init__(self, out_dir: Path) -> None:
        self.out_dir = Path(out_dir)
        self.crops_dir = self.out_dir / "crops"
        self.masks_dir = self.out_dir / "masks"
        self.crops_dir.mkdir(parents=True, exist_ok=True)
        self.masks_dir.mkdir(parents=True, exist_ok=True)
        self._manifest: dict[int, list[dict]] = {}
        self._summary: dict | None = None
        self._tid_dirs_made: set[int] = set()

    def on_detection(self, tf: TrackedFrame, det: Detection) -> None:
        tid_dir = self.crops_dir / f"bottle_{det.tid:03d}"
        mask_tid_dir = self.masks_dir / f"bottle_{det.tid:03d}"
        if det.tid not in self._tid_dirs_made:
            tid_dir.mkdir(exist_ok=True)
            mask_tid_dir.mkdir(exist_ok=True)
            self._tid_dirs_made.add(det.tid)

        crop_name = f"frame_{tf.frame_idx:06d}.jpg"
        mask_name = f"frame_{tf.frame_idx:06d}.png"
        crop_path = tid_dir / crop_name
        mask_path = mask_tid_dir / mask_name
        cv2.imwrite(str(crop_path), det.crop)
        cv2.imwrite(str(mask_path), (det.mask_crop.astype(np.uint8)) * 255)

        self._manifest.setdefault(det.tid, []).append({
            "frame_idx": tf.frame_idx,
            "timestamp_s": round(tf.timestamp_s, 3),
            "conf": round(det.conf, 3),
            "bbox_xyxy": list(det.xyxy),
            "crop": str(crop_path.relative_to(self.out_dir)),
            "mask": str(mask_path.relative_to(self.out_dir)),
        })

    def finalize(self, kept_tids: set[int], frame_counts: dict[int, int]) -> None:
        for tid in list(self._manifest.keys()):
            if tid not in kept_tids:
                shutil.rmtree(self.crops_dir / f"bottle_{tid:03d}", ignore_errors=True)
                shutil.rmtree(self.masks_dir / f"bottle_{tid:03d}", ignore_errors=True)
                del self._manifest[tid]

        bottles = [
            {
                "track_id": tid,
                "crop_count": len(entries),
                "frames_seen": frame_counts.get(tid, 0),
                "crops_dir": f"crops/bottle_{tid:03d}",
                "masks_dir": f"masks/bottle_{tid:03d}",
                "crops": entries,
            }
            for tid, entries in sorted(self._manifest.items())
        ]
        self._summary = {"bottles": bottles}
        (self.out_dir / "summary.json").write_text(json.dumps(self._summary, indent=2))

    def summary(self) -> dict:
        return self._summary or {"bottles": []}
