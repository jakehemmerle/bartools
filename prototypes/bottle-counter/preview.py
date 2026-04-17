"""Async preview rendering — GIL-free annotator + bounded-queue worker.

Main thread enqueues per-frame dicts; worker renders + writes mp4. Bounded
queue provides backpressure so the renderer can't balloon memory.
"""
from __future__ import annotations

import queue
import threading
from pathlib import Path

import cv2
import numpy as np

_PREVIEW_SENTINEL = object()

_TRACK_COLORS = [
    (0, 255, 0), (0, 165, 255), (255, 255, 0), (255, 0, 255),
    (0, 255, 255), (128, 255, 0), (255, 128, 0), (128, 0, 255),
]


def draw_overlay_lite(
    frame: np.ndarray,
    xyxy: np.ndarray,
    ids: np.ndarray | None,
    confs: np.ndarray,
    masks_u8: np.ndarray | None,
    with_contours: bool = True,
) -> np.ndarray:
    """Lightweight box / id / mask-outline annotator.

    All ops release the GIL (cv2.rectangle, putText, resize, findContours,
    drawContours), so a worker thread running this does NOT starve the main
    inference loop the way r.plot()'s numpy alpha-blend does.
    """
    H, W = frame.shape[:2]
    out = frame
    n = len(xyxy)
    if n == 0:
        return out

    if with_contours and masks_u8 is not None:
        for i in range(min(n, len(masks_u8))):
            m = masks_u8[i]
            if m.shape != (H, W):
                m = cv2.resize(m, (W, H), interpolation=cv2.INTER_NEAREST)
            contours, _ = cv2.findContours(
                m, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
            )
            color = _TRACK_COLORS[int(ids[i]) % len(_TRACK_COLORS)] if ids is not None else (0, 255, 0)
            cv2.drawContours(out, contours, -1, color, 2)

    for i in range(n):
        x1, y1, x2, y2 = (int(v) for v in xyxy[i])
        color = _TRACK_COLORS[int(ids[i]) % len(_TRACK_COLORS)] if ids is not None else (0, 255, 0)
        cv2.rectangle(out, (x1, y1), (x2, y2), color, 2)
        label = (f"#{int(ids[i])} {confs[i]:.2f}"
                 if ids is not None else f"{confs[i]:.2f}")
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        ly = max(th + 4, y1)
        cv2.rectangle(out, (x1, ly - th - 4), (x1 + tw + 4, ly), color, -1)
        cv2.putText(out, label, (x1 + 2, ly - 3),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2, cv2.LINE_AA)
    return out


class PreviewSink:
    """Async mp4 preview writer.

    submit(item) enqueues a dict {"frame", "xyxy", "ids", "confs", "masks"};
    worker runs draw_overlay_lite + resize + write. close() drains and joins.
    """

    def __init__(
        self,
        out_path: Path,
        fps: float,
        size: tuple[int, int],
    ) -> None:
        self.out_path = out_path
        self.pw, self.ph = size
        self.writer = cv2.VideoWriter(
            str(out_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (self.pw, self.ph),
        )
        self.q: queue.Queue = queue.Queue(maxsize=8)
        self.thread = threading.Thread(
            target=self._worker, daemon=True, name="preview-writer"
        )
        self.thread.start()

    def _worker(self) -> None:
        while True:
            item = self.q.get()
            if item is _PREVIEW_SENTINEL:
                break
            annotated = draw_overlay_lite(
                item["frame"], item["xyxy"], item["ids"],
                item["confs"], item["masks"],
            )
            if annotated.shape[:2] != (self.ph, self.pw):
                annotated = cv2.resize(
                    annotated, (self.pw, self.ph), interpolation=cv2.INTER_AREA
                )
            self.writer.write(annotated)

    def submit(self, item) -> None:
        self.q.put(item)

    def close(self) -> None:
        self.q.put(_PREVIEW_SENTINEL)
        self.thread.join()
        self.writer.release()
