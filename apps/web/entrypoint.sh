#!/bin/sh
set -e

cd /app

# Dependencies live in the Docker volume — not on the host.
export CI=true

pnpm install --frozen-lockfile

# Stale prebundles survive container restarts in the named node_modules volume.
rm -rf /app/node_modules/.vite 2>/dev/null || true

exec "$@"
