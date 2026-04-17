#!/usr/bin/env bash
# Creates the single Neon project `bartools` with a `staging` branch off main.
# Writes pooled connection strings into Pulumi stack secrets:
#   prod    -> main branch
#   staging -> staging branch
#
# Safe to re-run: skips creation if the project/branch already exists.

set -euo pipefail
source "$(dirname "$0")/_env.sh"

NEON_PROJECT_NAME="bartools"
NEON_ORG_ID="org-withered-mud-28878668"
NEON_REGION="aws-us-east-1"
DATABASE_NAME="neondb"

cd "$(dirname "$0")/.."

echo "==> Looking up Neon project $NEON_PROJECT_NAME"
PROJECT_ID="$(neon projects list --org-id "$NEON_ORG_ID" --output json \
  | jq -r ".[] | select(.name==\"$NEON_PROJECT_NAME\") | .id" | head -n1)"

if [[ -z "$PROJECT_ID" ]]; then
  echo "==> Creating Neon project $NEON_PROJECT_NAME in $NEON_REGION"
  PROJECT_ID="$(neon projects create \
    --name "$NEON_PROJECT_NAME" \
    --region-id "$NEON_REGION" \
    --org-id "$NEON_ORG_ID" \
    --output json | jq -r .project.id)"
  echo "    created $PROJECT_ID"
else
  echo "    found existing $PROJECT_ID"
fi

echo "==> Ensuring staging branch exists"
STAGING_BRANCH_ID="$(neon branches list --project-id "$PROJECT_ID" --output json \
  | jq -r '.[] | select(.name=="staging") | .id' | head -n1)"

if [[ -z "$STAGING_BRANCH_ID" ]]; then
  neon branches create --project-id "$PROJECT_ID" --name staging --output json > /dev/null
  echo "    created staging branch"
else
  echo "    staging branch exists ($STAGING_BRANCH_ID)"
fi

echo "==> Fetching pooled connection strings and writing to Pulumi stacks"
for pair in prod:main staging:staging; do
  stack="${pair%%:*}"
  branch="${pair##*:}"
  url="$(neon connection-string "$branch" \
    --project-id "$PROJECT_ID" \
    --database-name "$DATABASE_NAME" \
    --pooled)"
  pulumi config set --stack "$stack" --secret bartools:databaseUrl "$url"
done

echo "==> Done. Both stacks now have databaseUrl secret configured."
