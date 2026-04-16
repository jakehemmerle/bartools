"""Bottle counter CLI — thin wrapper around Pipeline + a chosen Harvester.

Usage:
    uv run count.py <video> [--out runs/<name>] [--model yolo26n-seg.pt]
                    [--device mps|cuda:0|cpu] [--imgsz 960 | 960,544]
                    [--stride 1] [--preview-width 720] [--half]
                    [--tracker bytetrack.yaml] [--skip-preview]
                    [--harvester best|all]

Harvesters:
    best — one crop per unique bottle (scorer picks the winner). Flat output.
    all  — every frame's crop, binned by track ID. Folder per bottle.
           Handoff format for downstream classification / de-dup.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from harvesters import AllCropsHarvester, BestCropHarvester
from pipeline import TRACKER_YAML, Pipeline, parse_imgsz

HARVESTERS = {"best": BestCropHarvester, "all": AllCropsHarvester}


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
                   help="fp16; OFF by default since MPS fp16 is often slower than fp32")
    p.add_argument("--skip-preview", action="store_true",
                   help="skip preview rendering + mp4 encoding entirely")
    p.add_argument("--tracker", default=str(TRACKER_YAML),
                   help="tracker yaml path. default: botsort_bottles.yaml")
    p.add_argument("--harvester", choices=list(HARVESTERS), default="best",
                   help="best: flat list, one crop per bottle (scored). "
                        "all: folder per bottle with every crop (for downstream pipelines)")
    args = p.parse_args()

    out = args.out or Path("runs") / args.video.stem
    out.mkdir(parents=True, exist_ok=True)

    harvester = HARVESTERS[args.harvester](out_dir=out)

    pipeline = Pipeline(
        model=args.model,
        device=args.device,
        imgsz=args.imgsz,
        tracker=args.tracker,
        stride=args.stride,
        half=args.half,
        skip_preview=args.skip_preview,
        preview_width=args.preview_width,
    )
    preview_out = None if args.skip_preview else (out / "preview.mp4")

    stats = pipeline.run(
        video=args.video, harvesters=[harvester], preview_out=preview_out,
    )

    combined = {
        **stats.to_dict(),
        "harvester": harvester.name,
        "preview_video": "preview.mp4" if preview_out else None,
        **harvester.summary(),
    }
    (out / "summary.json").write_text(json.dumps(combined, indent=2))

    print(f"\n=== done ===")
    print(f"unique bottles: {stats.unique_bottle_count}")
    print(f"dropped flicker tracks: {stats.dropped_flicker_tracks}")
    print(f"wall time: {round(stats.wall_seconds, 2)}s "
          f"({round(stats.inference_fps, 2)} fps inference)")
    print(f"harvester: {harvester.name}")
    print(f"outputs: {out}")


if __name__ == "__main__":
    main()
