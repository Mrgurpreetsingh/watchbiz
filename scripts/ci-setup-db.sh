#!/bin/bash
# CI Database Setup Script
# Sets up test database for CI environment

set -e  # Exit on error

echo "🗄️  Setting up test database for CI..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL not set"
  echo "Please set DATABASE_URL environment variable"
  exit 1
fi

echo "📋 Database URL: ${DATABASE_URL}"

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "🚀 Running database migrations..."
npx prisma migrate deploy

# Verify migration status
echo "✅ Verifying migration status..."
npx prisma migrate status

# Optional: Seed database
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding test database..."
  npx prisma db seed || echo "⚠️  No seed script found, skipping..."
fi

echo "✅ Database setup complete!"
