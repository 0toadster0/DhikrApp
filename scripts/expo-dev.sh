#!/usr/bin/env bash
# Start Metro for Expo dev client. Replit: sets proxy/packager env when both
# REPLIT_EXPO_DEV_DOMAIN and REPLIT_DEV_DOMAIN are set. Local: clears those vars
# and uses localhost (reliable iOS Simulator). Pass extra flags after --.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -n "${REPLIT_EXPO_DEV_DOMAIN:-}" ] && [ -n "${REPLIT_DEV_DOMAIN:-}" ]; then
  export EXPO_PACKAGER_PROXY_URL="https://${REPLIT_EXPO_DEV_DOMAIN}"
  export EXPO_PUBLIC_DOMAIN="${REPLIT_DEV_DOMAIN}"
  export EXPO_PUBLIC_REPL_ID="${REPL_ID:-}"
  export REACT_NATIVE_PACKAGER_HOSTNAME="${REPLIT_DEV_DOMAIN}"
  exec pnpm exec expo start --dev-client --localhost --port "${PORT:-8081}" "$@"
else
  unset EXPO_PACKAGER_PROXY_URL REACT_NATIVE_PACKAGER_HOSTNAME || true
  unset EXPO_PUBLIC_DOMAIN EXPO_PUBLIC_REPL_ID || true
  exec pnpm exec expo start --dev-client --localhost "$@"
fi
