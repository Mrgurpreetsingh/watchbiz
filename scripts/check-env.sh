#!/bin/bash
# Environment Variables Checker
# Verifies all required environment variables are set

set -e

echo "🔍 Checking required environment variables..."

# Define required variables
REQUIRED_VARS=(
  "DATABASE_URL"
  "NEXTAUTH_SECRET"
  "NEXTAUTH_URL"
  "STRIPE_SECRET_KEY"
  "STRIPE_PUBLISHABLE_KEY"
  "STRIPE_WEBHOOK_SECRET"
)

# Optional but recommended variables
OPTIONAL_VARS=(
  "RESEND_API_KEY"
  "NEXT_PUBLIC_APP_URL"
  "CODECOV_TOKEN"
  "VERCEL_TOKEN"
)

# Track missing variables
MISSING_REQUIRED=()
MISSING_OPTIONAL=()

# Check required variables
echo ""
echo "📋 Required Variables:"
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "  ❌ $var - MISSING"
    MISSING_REQUIRED+=("$var")
  else
    echo "  ✅ $var - Set"
  fi
done

# Check optional variables
echo ""
echo "📋 Optional Variables:"
for var in "${OPTIONAL_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "  ⚠️  $var - Not set"
    MISSING_OPTIONAL+=("$var")
  else
    echo "  ✅ $var - Set"
  fi
done

# Summary
echo ""
echo "═══════════════════════════════════════"
if [ ${#MISSING_REQUIRED[@]} -eq 0 ]; then
  echo "✅ All required environment variables are set!"

  if [ ${#MISSING_OPTIONAL[@]} -gt 0 ]; then
    echo "⚠️  ${#MISSING_OPTIONAL[@]} optional variable(s) not set:"
    for var in "${MISSING_OPTIONAL[@]}"; do
      echo "   - $var"
    done
  fi

  exit 0
else
  echo "❌ Missing ${#MISSING_REQUIRED[@]} required variable(s):"
  for var in "${MISSING_REQUIRED[@]}"; do
    echo "   - $var"
  done
  echo ""
  echo "Please set these variables in:"
  echo "  - Local: .env.local or .env.test"
  echo "  - CI: GitHub Secrets"
  echo "  - Production: Vercel Environment Variables"
  exit 1
fi
