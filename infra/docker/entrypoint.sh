#!/bin/sh
set -e

cd /app

# node_modules lives in a Docker volume, not on the host bind mount.
if [ ! -d node_modules/.pnpm ]; then
  echo "Installing dependencies inside container..."
  pnpm install --frozen-lockfile
fi

exec "$@"
