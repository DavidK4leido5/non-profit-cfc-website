#!/bin/sh
set -e

cd /app

# Dependencies live in Docker volumes — not on the host bind mount.
# Without CI=true, pnpm aborts module-dir removal when there is no TTY.
export CI=true

vite_js="/app/apps/web/node_modules/vite/bin/vite.js"

if [ ! -f "$vite_js" ]; then
  # Soft relink is not enough: pnpm may report "Already up to date" while
  # anonymous package volumes still have missing/stale symlinks. Recreate the
  # shared store + package volumes together.
  echo "web entrypoint: vite missing — recreating node_modules volumes"
  find /app/node_modules -mindepth 1 -delete 2>/dev/null || true
  find /app/apps/web/node_modules -mindepth 1 -delete 2>/dev/null || true
  find /app/packages/ui/node_modules -mindepth 1 -delete 2>/dev/null || true
  find /app/apps/auth/node_modules -mindepth 1 -delete 2>/dev/null || true
  pnpm install --frozen-lockfile
else
  pnpm install --frozen-lockfile
fi

if [ ! -f "$vite_js" ]; then
  echo "web entrypoint: vite still missing after reinstall" >&2
  ls -la /app/apps/web/node_modules 2>&1 | head -40 >&2 || true
  exit 1
fi

# Stale Vite prebundles survive container restarts in node_modules volumes.
rm -rf /app/node_modules/.vite /app/apps/web/node_modules/.vite 2>/dev/null || true

exec "$@"
