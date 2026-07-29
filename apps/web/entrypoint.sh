#!/bin/sh
set -e

cd /app

# Dependencies live in the Docker volume — not on the host.
export CI=true

pnpm install --frozen-lockfile

exec "$@"
