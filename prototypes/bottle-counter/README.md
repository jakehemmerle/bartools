# bottle-counter

YOLO-based bottle tracking + best-frame harvester for BarBack.

Given a video panning over a shelf of bottles, produces:
- unique bottle count (via BoT-SORT track IDs w/ ReID)
- tight crop of the best frame per bottle (for downstream classification)
- binary mask per bottle (for volume/fill-line estimation)
- annotated preview video w/ boxes + masks + track IDs

## Usage

```bash
uv run count.py /path/to/video.MOV
# outputs → runs/<video_stem>/
```

## Tuning

See `botsort_bottles.yaml` — ReID is enabled and thresholds are tuned for
handheld-pan capture of stationary bottles. Defaults spawn too many IDs
when bottles briefly leave frame during a pan.
