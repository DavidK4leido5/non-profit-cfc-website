#!/bin/sh
set -e

cd /app

# Dependencies live in Docker volumes — not on the host bind mount.
# Without CI=true, pnpm aborts module-dir removal when there is no TTY.
export CI=true

pnpm install --frozen-lockfile

exec "$@"
