#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../../.." && pwd)

SERVICE_NAME=${BARTOOLS_RAILWAY_SERVICE:-dashboard}
KEEP_TEMP=0
DRY_RUN=0

usage() {
  cat <<'EOF'
Usage: deploy-railway.sh [--service <name>] [--dry-run] [--keep-temp]

Build a trimmed upload bundle for the dashboard and deploy it with Railway.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --service)
      shift
      if [ "$#" -eq 0 ]; then
        echo "error: --service requires a value" >&2
        exit 1
      fi
      SERVICE_NAME=$1
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    --keep-temp)
      KEEP_TEMP=1
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "error: unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

BUNDLE_DIR=$(mktemp -d "${TMPDIR:-/tmp}/bartools-dashboard-deploy.XXXXXX")

cleanup() {
  if [ "$KEEP_TEMP" -eq 1 ] || [ "$DRY_RUN" -eq 1 ]; then
    return
  fi

  rm -rf "$BUNDLE_DIR"
}

trap cleanup EXIT INT TERM

mkdir -p "$BUNDLE_DIR/packages"

cp \
  "$REPO_ROOT/package.json" \
  "$REPO_ROOT/bun.lock" \
  "$REPO_ROOT/tsconfig.base.json" \
  "$REPO_ROOT/.dockerignore" \
  "$REPO_ROOT/railway.toml" \
  "$BUNDLE_DIR/"

for manifest in "$REPO_ROOT"/packages/*/package.json; do
  relative_path=${manifest#"$REPO_ROOT"/}
  mkdir -p "$BUNDLE_DIR/$(dirname "$relative_path")"
  cp "$manifest" "$BUNDLE_DIR/$relative_path"
done

rsync -a --exclude node_modules "$REPO_ROOT/packages/dashboard" "$BUNDLE_DIR/packages/"
rsync -a --exclude node_modules "$REPO_ROOT/packages/types" "$BUNDLE_DIR/packages/"

echo "Prepared Railway bundle at $BUNDLE_DIR"

if [ "$DRY_RUN" -eq 1 ]; then
  echo "Dry run only. No deploy started."
  exit 0
fi

cd "$REPO_ROOT"
exec railway up "$BUNDLE_DIR" --path-as-root -s "$SERVICE_NAME" -c
