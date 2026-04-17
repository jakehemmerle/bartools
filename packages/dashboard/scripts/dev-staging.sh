#!/bin/sh

set -eu

: "${BARTOOLS_API_PROXY_TARGET:=https://bartools-backend-staging-zjausnxoyq-ue.a.run.app}"
: "${VITE_BARTOOLS_API_BASE_URL:=/api}"
: "${BARTOOLS_DASHBOARD_DEV_HOST:=127.0.0.1}"
: "${BARTOOLS_DASHBOARD_DEV_PORT:=4174}"

export BARTOOLS_API_PROXY_TARGET
export VITE_BARTOOLS_API_BASE_URL

exec vite \
  --host "$BARTOOLS_DASHBOARD_DEV_HOST" \
  --port "$BARTOOLS_DASHBOARD_DEV_PORT"
