#!/usr/bin/env bash
# Run a command with Replit packager proxy env cleared unless full Replit dev
# context is present (same gate as scripts/expo-dev.sh). Use for expo run:* so
# a stale shell EXPO_PACKAGER_PROXY_URL does not break local native builds.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -z "${REPLIT_EXPO_DEV_DOMAIN:-}" ] || [ -z "${REPLIT_DEV_DOMAIN:-}" ]; then
  unset EXPO_PACKAGER_PROXY_URL REACT_NATIVE_PACKAGER_HOSTNAME || true
  unset EXPO_PUBLIC_DOMAIN EXPO_PUBLIC_REPL_ID || true
fi

exec "$@"
