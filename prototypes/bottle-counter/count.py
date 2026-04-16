"""Bottle counter + best-frame harvester.

Usage:
    uv run count.py <video_path> [--out runs/<name>] [--model yolo26n-seg.pt]
                    [--device mps|cuda:0|cpu] [--imgsz 960 | 960,544]
                    [--stride 1] [--preview-width 720] [--half]
                    [--tracker bytetrack.yaml] [--skip-preview]
"""
from __future__ import annotations

import argparse
import json
import queue
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

_PREVIEW_SENTINEL = object()

BOTTLE_CLASS_ID = 39  # COCO "bottle"
MIN_FRAMES_TO_COUNT = 5
DEFAULT_TRACKER = "bytetrack.yaml"  # ultralytics builtin; no ReID, ~2x faster than BoT-SORT

# Cycled colors for track IDs in the lightweight annotator (BGR).
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

    masks_u8: optional (N, mH, mW) uint8 array with 0/1 values. Upsampled
    to frame size on the fly if shapes differ.
    """
    # Draws in-place on `frame`. Caller must pass a copy if the original
    # buffer needs to be preserved (the async preview worker does this).
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


@dataclass
class BestFrame:
    track_id: int
    score: float
    conf: float
    sharpness: float
    centeredness: float
    mask_area_norm: float
    frame_idx: int
    timestamp_s: float
    bbox: tuple[int, int, int, int]
    frames_seen: int = 1
    crop_path: str = ""
    mask_path: str = ""


@dataclass
class Tracker:
    frame_count_by_id: dict[int, int] = field(default_factory=dict)
    best_by_id: dict[int, BestFrame] = field(default_factory=dict)


def score_detection(
    conf: float, crop: np.ndarray, bbox: tuple[int, int, int, int],
    mask_px: int, frame_hw: tuple[int, int],
) -> tuple[float, float, float, float]:
    if crop.size == 0:
        return 0.0, 0.0, 0.0, 0.0
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY) if crop.ndim == 3 else crop
    sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    sharpness_norm = min(sharpness / 500.0, 1.0)

    H, W = frame_hw
    x1, y1, x2, y2 = bbox
    edge_margin = 8
    touching_edge = (
        x1 <= edge_margin or y1 <= edge_margin
        or x2 >= W - edge_margin or y2 >= H - edge_margin
    )
    centeredness = 0.3 if touching_edge else 1.0
    mask_area_norm = min(mask_px / (H * W * 0.05), 1.0)
    score = conf * sharpness_norm * centeredness * mask_area_norm
    return score, sharpness, centeredness, mask_area_norm


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


def process_video(
    video_path: Path, out_dir: Path, model_name: str,
    device: str, imgsz, stride: int, preview_width: int, half: bool,
    skip_preview: bool, tracker_yaml: str = DEFAULT_TRACKER,
) -> dict:
    out_dir.mkdir(parents=True, exist_ok=True)
    crops_dir = out_dir / "crops"
    masks_dir = out_dir / "masks"
    crops_dir.mkdir(exist_ok=True)
    masks_dir.mkdir(exist_ok=True)

    W, H, fps, total_frames = probe_video(video_path)

    if skip_preview:
        writer = None
        preview_path = None
        pw = ph = 0
        preview_q = None
        preview_thread = None
    else:
        pw = min(preview_width, W)
        ph = int(H * pw / W)
        if ph % 2:
            ph += 1
        preview_path = out_dir / "preview.mp4"
        writer = cv2.VideoWriter(
            str(preview_path), cv2.VideoWriter_fourcc(*"mp4v"),
            fps / stride, (pw, ph),
        )
        # Async preview: main thread enqueues a numpy dict per frame;
        # worker draws via draw_overlay_lite (GIL-free cv2 calls) +
        # resize + writer.write. Bounded queue provides backpressure.
        preview_q: queue.Queue = queue.Queue(maxsize=8)

        def _preview_worker() -> None:
            while True:
                item = preview_q.get()
                if item is _PREVIEW_SENTINEL:
                    break
                annotated = draw_overlay_lite(
                    item["frame"], item["xyxy"], item["ids"],
                    item["confs"], item["masks"],
                )
                if annotated.shape[:2] != (ph, pw):
                    annotated = cv2.resize(
                        annotated, (pw, ph), interpolation=cv2.INTER_AREA
                    )
                writer.write(annotated)

        preview_thread = threading.Thread(
            target=_preview_worker, daemon=True, name="preview-writer"
        )
        preview_thread.start()

    model = YOLO(model_name)
    tracker = Tracker()
    processed = 0
    t0 = time.time()

    print(
        f"[info] {video_path.name}: {W}x{H} @ {fps:.1f}fps, {total_frames} frames | "
        f"device={device} half={half} imgsz={imgsz} stride={stride} stream=True"
    )

    results_iter = model.track(
        source=str(video_path), stream=True, persist=True,
        tracker=tracker_yaml,
        classes=[BOTTLE_CLASS_ID], conf=0.25, iou=0.5,
        imgsz=imgsz, device=device, half=half,
        vid_stride=stride, verbose=False,
    )

    for r in results_iter:
        frame = r.orig_img  # BGR, full-res — no second resize
        processed += 1
        frame_idx = (processed - 1) * stride

        has_dets = r.boxes is not None and r.boxes.id is not None
        ids = confs = xyxy = masks = None
        if has_dets:
            ids = r.boxes.id.int().cpu().numpy()
            confs = r.boxes.conf.cpu().numpy()
            xyxy = r.boxes.xyxy.int().cpu().numpy()
            if r.masks is not None:
                masks = r.masks.data.cpu().numpy().astype(bool)

        if preview_q is not None:
            # Self-contained dict — worker never touches r (whose tensors may
            # be freed on the next yield). Frame copied for async safety.
            preview_q.put({
                "frame": frame.copy(),
                "xyxy":  xyxy if has_dets else np.zeros((0, 4), dtype=np.int32),
                "ids":   ids,
                "confs": confs if has_dets else np.zeros(0, dtype=np.float32),
                "masks": masks.astype(np.uint8) if masks is not None else None,
            })

        if not has_dets:
            continue

        for i, tid in enumerate(ids):
            tid = int(tid)
            tracker.frame_count_by_id[tid] = tracker.frame_count_by_id.get(tid, 0) + 1

            x1, y1, x2, y2 = [int(v) for v in xyxy[i]]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(W, x2), min(H, y2)
            if x2 <= x1 or y2 <= y1:
                continue

            crop = frame[y1:y2, x1:x2]
            if masks is not None and i < len(masks):
                m = masks[i]
                if m.shape != (H, W):
                    m = cv2.resize(
                        m.astype(np.uint8), (W, H), interpolation=cv2.INTER_NEAREST
                    ).astype(bool)
                mask_px = int(m.sum())
                mask_crop = m[y1:y2, x1:x2]
            else:
                mask_px = (x2 - x1) * (y2 - y1)
                mask_crop = np.ones((y2 - y1, x2 - x1), dtype=bool)

            score, sharpness, centeredness, area_norm = score_detection(
                float(confs[i]), crop, (x1, y1, x2, y2), mask_px, (H, W),
            )

            prev = tracker.best_by_id.get(tid)
            if prev is None or score > prev.score:
                tracker.best_by_id[tid] = BestFrame(
                    track_id=tid, score=score, conf=float(confs[i]),
                    sharpness=sharpness, centeredness=centeredness,
                    mask_area_norm=area_norm, frame_idx=frame_idx,
                    timestamp_s=frame_idx / fps,
                    bbox=(x1, y1, x2, y2),
                    frames_seen=tracker.frame_count_by_id[tid],
                )
                crop_path = crops_dir / f"bottle_{tid:03d}.jpg"
                cv2.imwrite(str(crop_path), crop)
                tracker.best_by_id[tid].crop_path = str(crop_path.relative_to(out_dir))
                mask_path = masks_dir / f"bottle_{tid:03d}.png"
                cv2.imwrite(str(mask_path), (mask_crop.astype(np.uint8)) * 255)
                tracker.best_by_id[tid].mask_path = str(mask_path.relative_to(out_dir))
            else:
                prev.frames_seen = tracker.frame_count_by_id[tid]

        if processed % 30 == 0:
            elapsed = time.time() - t0
            eff_fps = processed / elapsed if elapsed > 0 else 0
            print(
                f"[frame {frame_idx}/{total_frames}] "
                f"active_ids={len(tracker.best_by_id)} eff_fps={eff_fps:.1f}"
            )

    if preview_q is not None:
        preview_q.put(_PREVIEW_SENTINEL)
        preview_thread.join()
    if writer is not None:
        writer.release()
    elapsed = time.time() - t0

    kept = {
        tid: bf for tid, bf in tracker.best_by_id.items()
        if tracker.frame_count_by_id[tid] >= MIN_FRAMES_TO_COUNT
    }
    dropped_flickers = len(tracker.best_by_id) - len(kept)

    summary = {
        "video": str(video_path),
        "frames_total": total_frames,
        "frames_processed": processed,
        "fps": fps,
        "resolution": [W, H],
        "model": model_name,
        "device": device,
        "half": half,
        "imgsz": list(imgsz) if isinstance(imgsz, tuple) else imgsz,
        "stride": stride,
        "stream_mode": True,
        "wall_seconds": round(elapsed, 2),
        "inference_fps": round(processed / elapsed, 2) if elapsed > 0 else 0,
        "min_frames_to_count": MIN_FRAMES_TO_COUNT,
        "unique_bottle_count": len(kept),
        "tracks_before_filter": len(tracker.best_by_id),
        "dropped_flicker_tracks": dropped_flickers,
        "preview_video": (
            str(preview_path.relative_to(out_dir)) if preview_path else None
        ),
        "bottles": [
            {
                "track_id": bf.track_id,
                "score": round(bf.score, 4),
                "conf": round(bf.conf, 3),
                "sharpness": round(bf.sharpness, 1),
                "centeredness": bf.centeredness,
                "mask_area_norm": round(bf.mask_area_norm, 3),
                "best_frame_idx": bf.frame_idx,
                "best_timestamp_s": round(bf.timestamp_s, 2),
                "bbox_xyxy": list(bf.bbox),
                "frames_seen": bf.frames_seen,
                "crop": bf.crop_path,
                "mask": bf.mask_path,
            }
            for bf in sorted(kept.values(), key=lambda b: b.track_id)
        ],
    }

    (out_dir / "summary.json").write_text(json.dumps(summary, indent=2))
    return summary


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("video", type=Path)
    p.add_argument("--out", type=Path, default=None)
    p.add_argument("--model", default="yolo26n-seg.pt")
    p.add_argument("--device", default="mps")
    p.add_argument("--imgsz", type=parse_imgsz, default="960,544",
                   help="int (e.g. 960) or 'H,W' tuple (e.g. 960,544)")
    p.add_argument("--stride", type=int, default=1,
                   help="vid_stride — run detection every Nth frame")
    p.add_argument("--preview-width", type=int, default=720)
    p.add_argument("--half", action="store_true",
                   help="fp16; OFF by default since MPS fp16 is often slower than fp32 "
                        "(see ultralytics issue #1719)")
    p.add_argument("--skip-preview", action="store_true",
                   help="skip preview rendering + mp4 encoding entirely "
                        "(useful for headless batch runs)")
    p.add_argument("--tracker", default=DEFAULT_TRACKER,
                   help="tracker yaml — ultralytics builtin name or path to "
                        "custom yaml (default: bytetrack.yaml)")
    args = p.parse_args()

    out = args.out or Path("runs") / args.video.stem
    summary = process_video(
        args.video, out, args.model,
        args.device, args.imgsz, args.stride, args.preview_width, args.half,
        args.skip_preview, args.tracker,
    )
    print(f"\n=== done ===")
    print(f"unique bottles: {summary['unique_bottle_count']}")
    print(f"dropped flicker tracks: {summary['dropped_flicker_tracks']}")
    print(f"wall time: {summary['wall_seconds']}s "
          f"({summary['inference_fps']} fps inference)")
    print(f"outputs: {out}")


if __name__ == "__main__":
    main()
