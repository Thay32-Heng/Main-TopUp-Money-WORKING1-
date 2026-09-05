#!/bin/sh
set -e

echo "=== Starting Topup Tenant Auto-Initialization ==="

# Execute tenant database migration if DATABASE_URL or DB_HOST is configured
if [ -n "$DATABASE_URL" ] || [ -n "$DB_HOST" ]; then
  echo "Running Database Auto-Migrator..."
  if command -v bun > /dev/null 2>&1; then
    bun scripts/init-tenant-db.ts || echo "Warning: DB auto-migration returned non-zero exit code"
  else
    npx tsx scripts/init-tenant-db.ts || echo "Warning: DB auto-migration returned non-zero exit code"
  fi
else
  echo "No database configuration detected, skipping DB auto-migration."
fi

echo "=== Starting Standalone Application Server ==="
if command -v bun > /dev/null 2>&1; then
  exec bun server.ts
else
  exec npx tsx server.ts
fi
