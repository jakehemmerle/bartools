#!/usr/bin/env bash
# Idempotent: configures docker-credential-helper for Artifact Registry
# and initializes Pulumi stacks. GCP projects + state bucket are assumed to
# already exist (created out-of-band in the first setup).
#
# Usage: bash infra/scripts/bootstrap.sh <staging|prod>

set -euo pipefail
source "$(dirname "$0")/_env.sh"
require_env "${1:-}"

REGION="us-east1"
STATE_BUCKET="gs://bartools-pulumi-state"

cd "$(dirname "$0")/.."

echo "==> Configuring docker credential helper for Artifact Registry"
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo "==> Logging pulumi into $STATE_BUCKET"
pulumi login "$STATE_BUCKET"

echo "==> Initializing Pulumi stack: $ENV"
if ! pulumi stack select "$ENV" 2>/dev/null; then
  pulumi stack init "$ENV"
fi

echo "==> Bootstrap complete for $ENV"
echo "   Next: bash infra/scripts/provision-neon.sh (once), then pulumi up --stack $ENV"
