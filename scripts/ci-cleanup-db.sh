#!/bin/bash
# CI Database Cleanup Script
# Cleans up test database after CI runs

set -e  # Exit on error

echo "🧹 Cleaning up test database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set, skipping cleanup"
  exit 0
fi

# Reset database (WARNING: Deletes all data)
if [ "$CI" = "true" ]; then
  echo "🗑️  Resetting test database..."
  npx prisma migrate reset --force --skip-seed || echo "⚠️  Reset failed or not needed"
  echo "✅ Database cleanup complete!"
else
  echo "⚠️  Not in CI environment, skipping database reset for safety"
fi
