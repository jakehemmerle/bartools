#!/usr/bin/env bash
# Usage: bash infra/scripts/deploy.sh <staging|prod>

set -euo pipefail
source "$(dirname "$0")/_env.sh"
require_env "${1:-}"

cd "$(dirname "$0")/.."

pulumi up --stack "$ENV"

SERVICE_URL="$(pulumi stack output --stack "$ENV" serviceUrl)"
echo
echo "==> Service URL: $SERVICE_URL"
echo "==> Health check:"
curl -fsS "$SERVICE_URL/health" && echo
