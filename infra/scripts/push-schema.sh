#!/usr/bin/env bash
# Applies the current Drizzle schema to the chosen env's Neon branch.
# Reads DATABASE_URL from the Pulumi stack config (Pulumi is source of truth).
#
# Usage: bash infra/scripts/push-schema.sh <staging|prod>

set -euo pipefail
source "$(dirname "$0")/_env.sh"
require_env "${1:-}"

cd "$(dirname "$0")/.."

echo "==> Reading DATABASE_URL from pulumi stack $ENV"
DATABASE_URL="$(pulumi config get --stack "$ENV" bartools:databaseUrl)"

if [[ -z "$DATABASE_URL" ]]; then
  echo "DATABASE_URL is empty — run provision-neon.sh first" >&2
  exit 1
fi

cd ../packages/backend
echo "==> Running drizzle-kit push against $ENV"
DATABASE_URL="$DATABASE_URL" bunx drizzle-kit push
