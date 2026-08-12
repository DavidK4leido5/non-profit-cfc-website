#!/bin/sh
set -e

cd /app

# Dependencies live in Docker volumes — not on the host bind mount.
# Without CI=true, pnpm aborts module-dir removal when there is no TTY.
export CI=true

vite_js="/app/apps/web/node_modules/vite/bin/vite.js"

# Soft `pnpm install` can report "Already up to date" while anonymous package
# volumes still miss new deps (e.g. class-variance-authority after a lockfile sync).
web_deps_ok() {
  node -e '
    const fs = require("fs");
    const path = require("path");
    const pkg = JSON.parse(fs.readFileSync("apps/web/package.json", "utf8"));
    const deps = [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
    ].filter((name) => !name.startsWith("@church/"));
    const missing = deps.filter((name) => {
      const target = path.join("apps/web/node_modules", ...name.split("/"));
      try {
        fs.lstatSync(target);
        return false;
      } catch {
        return true;
      }
    });
    if (missing.length) {
      console.error("web entrypoint: missing package links:", missing.join(", "));
      process.exit(1);
    }
  '
}

recreate_node_modules() {
  echo "web entrypoint: recreating node_modules volumes"
  find /app/node_modules -mindepth 1 -delete 2>/dev/null || true
  find /app/apps/web/node_modules -mindepth 1 -delete 2>/dev/null || true
  find /app/packages/ui/node_modules -mindepth 1 -delete 2>/dev/null || true
  find /app/apps/auth/node_modules -mindepth 1 -delete 2>/dev/null || true
  pnpm install --frozen-lockfile
}

pnpm install --frozen-lockfile

if [ ! -f "$vite_js" ] || ! web_deps_ok; then
  recreate_node_modules
fi

if [ ! -f "$vite_js" ]; then
  echo "web entrypoint: vite still missing after reinstall" >&2
  ls -la /app/apps/web/node_modules 2>&1 | head -40 >&2 || true
  exit 1
fi

if ! web_deps_ok; then
  echo "web entrypoint: package links still missing after reinstall" >&2
  exit 1
fi

# Stale Vite prebundles survive container restarts in node_modules volumes.
rm -rf /app/node_modules/.vite /app/apps/web/node_modules/.vite 2>/dev/null || true

exec "$@"
