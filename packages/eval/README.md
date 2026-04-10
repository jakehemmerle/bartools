# @bartools/eval

Bottle-ID eval harness. Sends bar bottle photos to Claude (via the Agent SDK), asks the model to identify the bottle name (verbatim from `assets/verbena_simple.csv`) and the fill volume (0.0–1.0 in 0.1 steps), then scores the model against a hand-labeled ground truth via [LangSmith](https://smith.langchain.com).

## Setup

Add the following keys to the **repo-root** `.env` (do not create a `.env` inside this package):

```
CLAUDE_CODE_OAUTH_TOKEN=...   # from ~/.zshrc
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=...
```

See `.env.example` at the repo root for the full list.

## Commands

From `packages/eval/`:

```sh
bun run seed   # creates assets/verbena_simple_solutions.jsonl with one stub row per photo
bun run eval   # runs the harness, syncs to LangSmith dataset 'verbena-simple', writes predictions
bun test       # unit tests (no network)
```

## How labeling works

1. `bun run seed` creates `assets/verbena_simple_solutions.jsonl` with one row per photo in `assets/photos/`. New rows get `name: ""` and `volume: 0`.
2. Open the file and fill in real `name` (verbatim from `assets/verbena_simple.csv`) and `volume` (one of `0, 0.1, 0.2, …, 1.0`) by hand.
3. `bun run eval` syncs the labeled rows to a LangSmith dataset called `verbena-simple` and runs the model against them. Re-running `seed` is safe — existing labels are preserved.

## Output

- `assets/verbena_simple_solutions.jsonl` — ground truth (manual)
- `assets/verbena_simple_predictions.jsonl` — model predictions (regenerated each `bun run eval`)
- LangSmith experiments under dataset `verbena-simple`, prefixed with the model name

## Default model

`claude-sonnet-4-6`, hardcoded in `src/types.ts` (`DEFAULT_MODEL`). Change it there if you want to swap models.
