# Sourced by all infra scripts. Sets PULUMI_CONFIG_PASSPHRASE_FILE pointing at
# a stable per-laptop random passphrase. Generated on first run.
#
# Rationale: we use a self-managed GCS state backend, which requires a
# passphrase to encrypt config secrets. The file lives outside the repo so it
# is never checked in. If lost, re-encrypt with:
#   pulumi stack change-secrets-provider passphrase

BARTOOLS_PASSPHRASE_DIR="${HOME}/.config/bartools"
export PULUMI_CONFIG_PASSPHRASE_FILE="${BARTOOLS_PASSPHRASE_DIR}/pulumi-passphrase"

if [[ ! -f "$PULUMI_CONFIG_PASSPHRASE_FILE" ]]; then
  mkdir -p "$BARTOOLS_PASSPHRASE_DIR"
  chmod 700 "$BARTOOLS_PASSPHRASE_DIR"
  LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 48 > "$PULUMI_CONFIG_PASSPHRASE_FILE"
  chmod 600 "$PULUMI_CONFIG_PASSPHRASE_FILE"
  echo "==> Generated new Pulumi passphrase at $PULUMI_CONFIG_PASSPHRASE_FILE"
fi

require_env() {
  case "${1:-}" in
    staging|prod) ENV="$1" ;;
    *) echo "usage: $0 <staging|prod>" >&2; exit 1 ;;
  esac
}
