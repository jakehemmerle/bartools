"""Hot-loop microbenchmark for the bottle-counter pipeline.

Mirrors count.py's per-frame work with per-stage timers so we can iterate on
optimizations and compare runs apples-to-apples.

Usage:
    uv run bench.py                                    # defaults: .pt on mps, 960x544, 3 iters
    uv run bench.py --imgsz 640 --iters 5              # smaller input, 5 passes
    uv run bench.py --no-io --no-annotate              # isolate inference+postproc
    uv run bench.py --label "baseline" --tag fp32      # label result row

Results append to bench_results.jsonl next to this file for easy diffing.
"""
from __future__ import annotations

import argparse
import json
import statistics
import time
from pathlib import Path

import cv2
import numpy as np
from ultralytics import YOLO

from pipeline import parse_imgsz
from preview import PreviewSink
from scoring import score_detection

HERE = Path(__file__).parent
DEFAULT_CLIP = HERE / "bench_clip.mp4"
RESULTS_LOG = HERE / "bench_results.jsonl"
DEFAULT_TRACKER = "bytetrack.yaml"
BOTTLE_CLASS_ID = 39


def run_one_pass(model, clip, imgsz, device, half, do_io, do_annotate,
                 io_dir, tracker_yaml=DEFAULT_TRACKER, warmup=False):
    """Run model over the clip once, returning per-frame stage timings (ms).

    Preview (when do_annotate=True) always uses the async lite annotator
    matching count.py's production path.
    """
    t_infer, t_postproc, t_scoring, t_io, t_annotate = [], [], [], [], []
    finalize_ms = 0.0

    sink: PreviewSink | None = None
    if do_annotate:
        cap = cv2.VideoCapture(str(clip))
        W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        cap.release()
        pw, ph = 720, int(H * 720 / W)
        if ph % 2: ph += 1
        sink = PreviewSink(io_dir / "_bench_preview.mp4", fps, (pw, ph))

    common = dict(
        source=str(clip), stream=True, classes=[BOTTLE_CLASS_ID],
        conf=0.25, iou=0.5, imgsz=imgsz, device=device, half=half,
        verbose=False,
    )
    results_iter = model.track(
        persist=True, tracker=tracker_yaml, **common,
    )

    best_by_id = {}
    t_prev_end = time.perf_counter()

    for r in results_iter:
        t0 = time.perf_counter()

        # --- POSTPROC (torch -> numpy sync) ---
        has_dets = r.boxes is not None and len(r.boxes) > 0
        ids = confs = xyxy = masks = None
        if has_dets:
            ids = (r.boxes.id.int().cpu().numpy()
                   if r.boxes.id is not None else np.arange(len(r.boxes)))
            confs = r.boxes.conf.cpu().numpy()
            xyxy = r.boxes.xyxy.int().cpu().numpy()
            masks = (r.masks.data.cpu().numpy().astype(bool)
                     if r.masks is not None else None)
        t1 = time.perf_counter()

        # --- ANNOTATE ---
        if sink is not None:
            sink.submit({
                "frame": r.orig_img.copy(),
                "xyxy":  xyxy if has_dets else np.zeros((0, 4), dtype=np.int32),
                "ids":   ids,
                "confs": confs if has_dets else np.zeros(0, dtype=np.float32),
                "masks": masks.astype(np.uint8) if masks is not None else None,
            })
        t2 = time.perf_counter()

        if not has_dets:
            t_infer.append((t0 - t_prev_end) * 1000)
            t_postproc.append((t1 - t0) * 1000)
            t_annotate.append((t2 - t1) * 1000)
            t_scoring.append(0); t_io.append(0)
            t_prev_end = time.perf_counter()
            continue

        # --- SCORING ---
        frame = r.orig_img
        H, W = frame.shape[:2]
        crops_to_save = []
        for i, tid in enumerate(ids):
            tid = int(tid)
            x1, y1, x2, y2 = [int(v) for v in xyxy[i]]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(W, x2), min(H, y2)
            if x2 <= x1 or y2 <= y1:
                continue
            crop = frame[y1:y2, x1:x2]
            if masks is not None and i < len(masks):
                m = masks[i]
                if m.shape != (H, W):
                    m = cv2.resize(m.astype(np.uint8), (W, H),
                                   interpolation=cv2.INTER_NEAREST).astype(bool)
                mask_px = int(m.sum())
                mask_crop = m[y1:y2, x1:x2]
            else:
                mask_px = (x2 - x1) * (y2 - y1)
                mask_crop = np.ones((y2 - y1, x2 - x1), dtype=bool)
            score = score_detection(float(confs[i]), crop, (x1, y1, x2, y2),
                                    mask_px, (H, W))[0]
            prev = best_by_id.get(tid, -1)
            if score > prev:
                best_by_id[tid] = score
                if do_io:
                    crops_to_save.append((tid, crop, mask_crop))
        t3 = time.perf_counter()

        # --- IO ---
        if do_io:
            for tid, crop, mask_crop in crops_to_save:
                cv2.imwrite(str(io_dir / f"bench_{tid:03d}.jpg"), crop)
                cv2.imwrite(str(io_dir / f"bench_{tid:03d}.png"),
                            (mask_crop.astype(np.uint8)) * 255)
        t4 = time.perf_counter()

        t_infer.append((t0 - t_prev_end) * 1000)
        t_postproc.append((t1 - t0) * 1000)
        t_annotate.append((t2 - t1) * 1000)
        t_scoring.append((t3 - t2) * 1000)
        t_io.append((t4 - t3) * 1000)
        t_prev_end = t4

    if sink is not None:
        t_fin = time.perf_counter()
        sink.close()
        finalize_ms = (time.perf_counter() - t_fin) * 1000

    return {
        "infer":    t_infer,
        "annotate": t_annotate,
        "postproc": t_postproc,
        "scoring":  t_scoring,
        "io":       t_io,
        "finalize_ms": finalize_ms,
    }


def summarize(name, vals):
    if not vals:
        return {"stage": name, "n": 0}
    return {
        "stage": name,
        "n":    len(vals),
        "mean": round(statistics.mean(vals), 2),
        "p50":  round(statistics.median(vals), 2),
        "p95":  round(sorted(vals)[int(len(vals) * 0.95)], 2) if len(vals) > 1 else round(vals[0], 2),
        "min":  round(min(vals), 2),
        "max":  round(max(vals), 2),
        "sum":  round(sum(vals), 2),
    }


def fmt_table(stages):
    rows = [("stage", "n", "mean", "p50", "p95", "min", "max", "sum")]
    for s in stages:
        rows.append((
            s["stage"], str(s.get("n", 0)),
            f'{s.get("mean", 0):.2f}', f'{s.get("p50", 0):.2f}',
            f'{s.get("p95", 0):.2f}', f'{s.get("min", 0):.2f}',
            f'{s.get("max", 0):.2f}', f'{s.get("sum", 0):.2f}',
        ))
    widths = [max(len(r[i]) for r in rows) for i in range(len(rows[0]))]
    out = []
    for i, r in enumerate(rows):
        out.append("  ".join(c.ljust(widths[j]) for j, c in enumerate(r)))
        if i == 0:
            out.append("  ".join("-" * w for w in widths))
    return "\n".join(out)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--clip", type=Path, default=DEFAULT_CLIP)
    p.add_argument("--model", default="yolo26n-seg.pt")
    p.add_argument("--device", default="mps")
    p.add_argument("--imgsz", type=parse_imgsz, default="960,544")
    p.add_argument("--half", action="store_true")
    p.add_argument("--warmup", type=int, default=1, help="passes to discard")
    p.add_argument("--iters", type=int, default=3, help="measured passes")
    p.add_argument("--no-io", action="store_true")
    p.add_argument("--no-annotate", action="store_true")
    p.add_argument("--tracker", default=DEFAULT_TRACKER,
                   help="tracker yaml (default: bytetrack.yaml)")
    p.add_argument("--label", default="", help="free-form label for the results row")
    p.add_argument("--tag", action="append", default=[], help="repeatable tag")
    args = p.parse_args()

    if not args.clip.exists():
        raise SystemExit(f"clip not found: {args.clip}")

    io_dir = HERE / "_bench_out"
    io_dir.mkdir(exist_ok=True)

    print(f"[bench] model={args.model} device={args.device} imgsz={args.imgsz} "
          f"half={args.half} io={not args.no_io} annotate={not args.no_annotate}")

    t_load = time.perf_counter()
    model = YOLO(args.model)
    load_ms = (time.perf_counter() - t_load) * 1000
    print(f"[bench] model load: {load_ms:.1f} ms")

    do_io = not args.no_io
    do_annotate = not args.no_annotate

    # --- WARMUP ---
    for i in range(args.warmup):
        print(f"[bench] warmup {i+1}/{args.warmup}…")
        run_one_pass(model, args.clip, args.imgsz, args.device, args.half,
                     do_io, do_annotate, io_dir,
                     tracker_yaml=args.tracker, warmup=True)

    # --- MEASURE ---
    agg = {k: [] for k in ("infer", "annotate", "postproc", "scoring", "io")}
    finalize_samples = []
    t_wall_start = time.perf_counter()
    for i in range(args.iters):
        print(f"[bench] iter {i+1}/{args.iters}…")
        r = run_one_pass(model, args.clip, args.imgsz, args.device, args.half,
                         do_io, do_annotate, io_dir,
                         tracker_yaml=args.tracker)
        for k in agg:
            agg[k].extend(r[k])
        finalize_samples.append(r["finalize_ms"])
    t_wall = time.perf_counter() - t_wall_start
    mean_finalize = statistics.mean(finalize_samples) if finalize_samples else 0

    stages = [summarize(k, agg[k]) for k in ("infer", "postproc", "scoring", "io", "annotate")]
    total_per_frame = sum(s.get("mean", 0) for s in stages)
    n_frames = len(agg["infer"])
    eff_fps = n_frames / t_wall if t_wall > 0 else 0

    print()
    print(fmt_table(stages))
    print()
    print(f"total mean ms/frame: {total_per_frame:.2f}  "
          f"theoretical fps: {1000/total_per_frame:.1f}" if total_per_frame > 0 else "")
    print(f"wall: {t_wall:.2f}s  frames: {n_frames}  eff fps: {eff_fps:.1f}")
    if do_annotate:
        print(f"preview finalize drain: {mean_finalize:.1f} ms/iter")

    # --- LOG ---
    row = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "label": args.label,
        "tags": args.tag,
        "model": args.model,
        "device": args.device,
        "imgsz": list(args.imgsz) if isinstance(args.imgsz, tuple) else args.imgsz,
        "half": args.half,
        "io": do_io,
        "annotate": do_annotate,
        "warmup": args.warmup,
        "iters": args.iters,
        "model_load_ms": round(load_ms, 1),
        "n_frames": n_frames,
        "wall_s": round(t_wall, 3),
        "eff_fps": round(eff_fps, 2),
        "total_mean_ms": round(total_per_frame, 2),
        "finalize_ms_mean": round(mean_finalize, 1),
        "stages": {s["stage"]: {k: s[k] for k in ("mean", "p50", "p95")
                                if k in s} for s in stages},
    }
    with RESULTS_LOG.open("a") as f:
        f.write(json.dumps(row) + "\n")
    print(f"\nlogged → {RESULTS_LOG.name}")


if __name__ == "__main__":
    main()
