"""Shared data transfer objects for the pipeline → harvester handoff.

Detection carries the raw facts about a single tracked bottle in one frame.
No scoring fields — that's a harvester concern (see scoring.py).
"""
from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass
class Detection:
    tid: int
    xyxy: tuple[int, int, int, int]
    conf: float
    crop: np.ndarray
    mask_crop: np.ndarray
    mask_px: int


@dataclass
class TrackedFrame:
    frame: np.ndarray
    frame_idx: int
    timestamp_s: float
    H: int
    W: int
    fps: float
    dets: list[Detection]
    xyxy_raw: np.ndarray | None = None
    ids_raw: np.ndarray | None = None
    confs_raw: np.ndarray | None = None
    masks_raw: np.ndarray | None = None
