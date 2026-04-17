"""End-to-end test for the pipeline + harvester split.

Runs the real YOLO model against bench_clip.mp4 (30 frames) through two
harvesters simultaneously. Asserts:
  - pipeline-level stats (frames processed, unique bottle count)
  - BestCropHarvester output: FLAT list of images, scorer breakdown in summary
  - AllCropsHarvester output: list of FOLDERS, many crops per folder, no scorer fields

Why a single test: exercises the full new API surface (Pipeline class,
Harvester protocol, both concrete harvesters, PipelineStats) in one go.
Runs in ~3s wall on M-series MPS.
"""
from __future__ import annotations

import json
from pathlib import Path

HERE = Path(__file__).parent
ROOT = HERE.parent
CLIP = ROOT / "bench_clip.mp4"
MODEL = ROOT / "yolo26n-seg.pt"
TRACKER = ROOT / "botsort_bottles.yaml"


def test_pipeline_runs_both_harvesters_with_distinct_layouts(tmp_path):
    from pipeline import Pipeline
    from harvesters import BestCropHarvester, AllCropsHarvester

    assert CLIP.exists(), f"missing fixture: {CLIP}"
    assert MODEL.exists(), f"missing model: {MODEL}"

    best_dir = tmp_path / "best"
    all_dir = tmp_path / "all"

    pipeline = Pipeline(
        model=str(MODEL),
        device="mps",
        imgsz=(960, 544),
        tracker=str(TRACKER),
        skip_preview=True,
    )
    stats = pipeline.run(
        video=CLIP,
        harvesters=[
            BestCropHarvester(out_dir=best_dir),
            AllCropsHarvester(out_dir=all_dir),
        ],
    )

    # --- pipeline-level invariants ---
    assert stats.frames_processed == 30
    assert stats.unique_bottle_count >= 3, (
        f"expected >=3 (smoke baseline is 4), got {stats.unique_bottle_count}"
    )

    # --- BestCrop layout: FLAT list of images, one per unique bottle ---
    best_crops = best_dir / "crops"
    best_jpgs = sorted(best_crops.glob("bottle_*.jpg"))
    best_pngs = sorted((best_dir / "masks").glob("bottle_*.png"))
    assert len(best_jpgs) == stats.unique_bottle_count
    assert len(best_pngs) == stats.unique_bottle_count
    # shape contract: no subdirectories under crops/
    assert not any(p.is_dir() for p in best_crops.iterdir()), (
        "BestCropHarvester must produce a flat list, not folders"
    )
    best_summary = json.loads((best_dir / "summary.json").read_text())
    assert len(best_summary["bottles"]) == stats.unique_bottle_count
    # scorer breakdown preserved so downstream "pick-the-best" consumers see it
    assert "sharpness" in best_summary["bottles"][0]
    assert "score" in best_summary["bottles"][0]

    # --- AllCrops layout: list of FOLDERS, each holding every frame crop for one bottle ---
    all_crops_root = all_dir / "crops"
    bottle_dirs = sorted(p for p in all_crops_root.iterdir() if p.is_dir())
    assert len(bottle_dirs) == stats.unique_bottle_count
    # shape contract: no flat files under crops/
    assert not any(p.is_file() for p in all_crops_root.iterdir()), (
        "AllCropsHarvester must produce folders, not flat files"
    )
    for d in bottle_dirs:
        jpgs = list(d.glob("frame_*.jpg"))
        assert len(jpgs) >= 2, f"{d.name} only has {len(jpgs)} crop(s)"
    total_all_crops = sum(len(list(d.glob("frame_*.jpg"))) for d in bottle_dirs)
    assert total_all_crops > stats.unique_bottle_count
    all_summary = json.loads((all_dir / "summary.json").read_text())
    assert "bottles" in all_summary
    assert all_summary["bottles"][0]["crop_count"] >= 2
    # scoring is out of scope for the 'all' strategy — no scorer fields leak in
    assert "sharpness" not in all_summary["bottles"][0]
    assert "score" not in all_summary["bottles"][0]
