#!/bin/sh
set -e

cd /app/apps/api

if [ ! -d vendor ]; then
  echo "Vendoring Go modules..."
  go mod vendor
fi

exec "$@"
