#!/bin/sh
set -e

cd /app

# Dependencies live in Docker volumes — not on the host bind mount.
export CI=true

pnpm install --frozen-lockfile

# Stale prebundles survive container restarts in named/anonymous node_modules volumes.
rm -rf /app/node_modules/.vite /app/apps/web/node_modules/.vite 2>/dev/null || true

exec "$@"
