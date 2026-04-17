"""Thin pipeline: video + model + tracker → raw tracked detections.

Pipeline does NOT score. Harvesters score (if they care) via Scorer plug-ins.
"""
from __future__ import annotations

import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Iterator

import cv2
import numpy as np
from ultralytics import YOLO

from coreml import force_coreml_ane
from detections import Detection, TrackedFrame
from preview import PreviewSink

BOTTLE_CLASS_ID = 39  # COCO "bottle"
MIN_FRAMES_TO_COUNT = 5
TRACKER_YAML = Path(__file__).parent / "botsort_bottles.yaml"


def parse_imgsz(s: str) -> int | tuple[int, int]:
    if "," in s:
        h, w = s.split(",")
        return (int(h), int(w))
    return int(s)


def probe_video(video_path: Path) -> tuple[int, int, float, int]:
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f"cannot open {video_path}")
    W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    return W, H, fps, total


@dataclass
class PipelineStats:
    video: str
    frames_total: int
    frames_processed: int
    fps: float
    resolution: tuple[int, int]
    model: str
    device: str
    half: bool
    imgsz: int | tuple[int, int]
    stride: int
    wall_seconds: float
    inference_fps: float
    unique_bottle_count: int
    tracks_before_filter: int
    dropped_flicker_tracks: int
    min_frames_to_count: int = MIN_FRAMES_TO_COUNT

    def to_dict(self) -> dict:
        return {
            "video": self.video,
            "frames_total": self.frames_total,
            "frames_processed": self.frames_processed,
            "fps": self.fps,
            "resolution": list(self.resolution),
            "model": self.model,
            "device": self.device,
            "half": self.half,
            "imgsz": list(self.imgsz) if isinstance(self.imgsz, tuple) else self.imgsz,
            "stride": self.stride,
            "wall_seconds": round(self.wall_seconds, 2),
            "inference_fps": round(self.inference_fps, 2),
            "unique_bottle_count": self.unique_bottle_count,
            "tracks_before_filter": self.tracks_before_filter,
            "dropped_flicker_tracks": self.dropped_flicker_tracks,
            "min_frames_to_count": self.min_frames_to_count,
        }


def iterate_tracked_detections(
    model: YOLO,
    video: Path,
    imgsz: int | tuple[int, int],
    device: str,
    half: bool,
    stride: int,
    tracker_yaml: str,
    frame_count_by_id: dict[int, int],
    fps: float,
) -> Iterator[TrackedFrame]:
    """Drives model.track() and yields post-processed TrackedFrames.

    Mutates frame_count_by_id so callers can apply MIN_FRAMES_TO_COUNT after.
    No scoring — that's the harvester's job.
    """
    results_iter = model.track(
        source=str(video), stream=True, persist=True,
        tracker=tracker_yaml,
        classes=[BOTTLE_CLASS_ID], conf=0.25, iou=0.5,
        imgsz=imgsz, device=device, half=half,
        vid_stride=stride, verbose=False,
    )

    processed = 0
    for r in results_iter:
        frame = r.orig_img
        H, W = frame.shape[:2]
        frame_idx = processed * stride
        processed += 1

        has_dets = r.boxes is not None and r.boxes.id is not None
        ids_raw = confs_raw = xyxy_raw = masks_raw = None
        dets: list[Detection] = []

        if has_dets:
            ids_raw = r.boxes.id.int().cpu().numpy()
            confs_raw = r.boxes.conf.cpu().numpy()
            xyxy_raw = r.boxes.xyxy.int().cpu().numpy()
            if r.masks is not None:
                masks_raw = r.masks.data.cpu().numpy().astype(bool)

            for i, tid in enumerate(ids_raw):
                tid = int(tid)
                frame_count_by_id[tid] = frame_count_by_id.get(tid, 0) + 1

                x1, y1, x2, y2 = [int(v) for v in xyxy_raw[i]]
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(W, x2), min(H, y2)
                if x2 <= x1 or y2 <= y1:
                    continue

                crop = frame[y1:y2, x1:x2]
                if masks_raw is not None and i < len(masks_raw):
                    m = masks_raw[i]
                    if m.shape != (H, W):
                        m = cv2.resize(
                            m.astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST
                        ).astype(bool)
                    mask_crop = m[y1:y2, x1:x2]
                    mask_px = int(mask_crop.sum())
                else:
                    mask_px = (x2 - x1) * (y2 - y1)
                    mask_crop = np.ones((y2 - y1, x2 - x1), dtype=bool)

                dets.append(Detection(
                    tid=tid,
                    xyxy=(x1, y1, x2, y2),
                    conf=float(confs_raw[i]),
                    crop=crop,
                    mask_crop=mask_crop,
                    mask_px=mask_px,
                ))

        yield TrackedFrame(
            frame=frame, frame_idx=frame_idx,
            timestamp_s=frame_idx / fps if fps > 0 else 0.0,
            H=H, W=W, fps=fps,
            dets=dets,
            xyxy_raw=xyxy_raw, ids_raw=ids_raw,
            confs_raw=confs_raw,
            masks_raw=masks_raw.astype(np.uint8) if masks_raw is not None else None,
        )


class Pipeline:
    def __init__(
        self,
        model: str,
        device: str = "mps",
        imgsz: int | tuple[int, int] = (960, 544),
        tracker: str = str(TRACKER_YAML),
        stride: int = 1,
        half: bool = False,
        skip_preview: bool = False,
        preview_width: int = 720,
    ) -> None:
        self.model_name = model
        self.device = device
        self.imgsz = imgsz
        self.tracker = tracker
        self.stride = stride
        self.half = half
        self.skip_preview = skip_preview
        self.preview_width = preview_width

    def run(
        self,
        video: Path,
        harvesters: Iterable,
        preview_out: Path | None = None,
    ) -> PipelineStats:
        video = Path(video)
        W, H, fps, total_frames = probe_video(video)

        preview_sink: PreviewSink | None = None
        if not self.skip_preview and preview_out is not None:
            pw = min(self.preview_width, W)
            ph = int(H * pw / W)
            if ph % 2:
                ph += 1
            preview_sink = PreviewSink(preview_out, fps / self.stride, (pw, ph))

        if self.model_name.endswith(".mlpackage") or self.model_name.endswith(".mlmodel"):
            force_coreml_ane()
        model = YOLO(self.model_name)

        frame_count_by_id: dict[int, int] = {}
        processed = 0
        t0 = time.time()

        print(
            f"[info] {video.name}: {W}x{H} @ {fps:.1f}fps, {total_frames} frames | "
            f"device={self.device} half={self.half} imgsz={self.imgsz} stride={self.stride}"
        )

        harvesters = list(harvesters)

        for tf in iterate_tracked_detections(
            model, video, self.imgsz, self.device, self.half, self.stride,
            self.tracker, frame_count_by_id, fps,
        ):
            processed += 1

            for det in tf.dets:
                for h in harvesters:
                    h.on_detection(tf, det)

            if preview_sink is not None:
                preview_sink.submit({
                    "frame": tf.frame.copy(),
                    "xyxy": tf.xyxy_raw if tf.xyxy_raw is not None else np.zeros((0, 4), dtype=np.int32),
                    "ids": tf.ids_raw,
                    "confs": tf.confs_raw if tf.confs_raw is not None else np.zeros(0, dtype=np.float32),
                    "masks": tf.masks_raw,
                })

            if processed % 30 == 0:
                elapsed = time.time() - t0
                eff_fps = processed / elapsed if elapsed > 0 else 0
                print(
                    f"[frame {tf.frame_idx}/{total_frames}] "
                    f"active_ids={len(frame_count_by_id)} eff_fps={eff_fps:.1f}"
                )

        if preview_sink is not None:
            preview_sink.close()

        elapsed = time.time() - t0

        kept_tids = {
            tid for tid, count in frame_count_by_id.items()
            if count >= MIN_FRAMES_TO_COUNT
        }
        dropped = len(frame_count_by_id) - len(kept_tids)

        for h in harvesters:
            h.finalize(kept_tids, frame_count_by_id)

        return PipelineStats(
            video=str(video),
            frames_total=total_frames,
            frames_processed=processed,
            fps=fps,
            resolution=(W, H),
            model=self.model_name,
            device=self.device,
            half=self.half,
            imgsz=self.imgsz,
            stride=self.stride,
            wall_seconds=elapsed,
            inference_fps=processed / elapsed if elapsed > 0 else 0.0,
            unique_bottle_count=len(kept_tids),
            tracks_before_filter=len(frame_count_by_id),
            dropped_flicker_tracks=dropped,
        )
