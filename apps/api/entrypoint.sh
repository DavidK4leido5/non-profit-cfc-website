#!/bin/sh
# Optional override entrypoint for one-off tasks (swagger, shell).
# Default compose CMD runs /usr/local/bin/church-api directly.
set -e
cd /app/apps/api
exec "$@"
