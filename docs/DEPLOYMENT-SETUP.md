# Deployment Setup Guide

Guide complet pour configurer le déploiement de WatchBiz sur Vercel avec CI/CD via GitHub Actions.

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Setup GitHub Repository](#setup-github-repository)
3. [Setup Vercel Project](#setup-vercel-project)
4. [Setup PostgreSQL Database](#setup-postgresql-database)
5. [Configure GitHub Secrets](#configure-github-secrets)
6. [Configure Vercel Environment Variables](#configure-vercel-environment-variables)
7. [Setup Stripe Webhooks](#setup-stripe-webhooks)
8. [First Deployment](#first-deployment)
9. [Verification](#verification)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Prérequis

### Comptes Nécessaires

- ✅ GitHub account (repository créé)
- ✅ Vercel account (https://vercel.com)
- ✅ PostgreSQL database provider:
  - **Vercel Postgres** (recommandé - intégration facile)
  - **Neon** (free tier généreux)
  - **Railway** (simple setup)
  - **Supabase** (PostgreSQL + backend)
- ✅ Stripe account (https://stripe.com)
- ✅ Codecov account (https://codecov.io) - optionnel

### CLI Tools

```bash
# Install Vercel CLI
npm install -g vercel

# Install GitHub CLI (optionnel)
npm install -g gh

# Install Stripe CLI (pour webhooks locaux)
npm install -g stripe
```

---

## 🔧 Setup GitHub Repository

### 1. Push Code to GitHub

```bash
# Initialize git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/watchbiz.git
git branch -M main
git push -u origin main
```

### 2. Configure Branch Protection

**GitHub → Settings → Branches → Add rule**

Configuration recommandée pour `main`:

```yaml
Branch name pattern: main

✅ Require a pull request before merging
   ✅ Require approvals: 1
   ✅ Dismiss stale pull request approvals when new commits are pushed

✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   Status checks:
     - Unit & Integration Tests
     - Lint & Type Check
     - Build Application

✅ Require conversation resolution before merging

✅ Include administrators (strictement appliqué)
```

### 3. Enable GitHub Actions

**GitHub → Settings → Actions → General**

```yaml
✅ Allow all actions and reusable workflows

Workflow permissions:
  ✅ Read and write permissions
  ✅ Allow GitHub Actions to create and approve pull requests
```

---

## 🚀 Setup Vercel Project

### Option 1: Via Web UI (Recommandé pour débutants)

1. **Se connecter à Vercel**
   - Visit: https://vercel.com
   - Click "Import Project"

2. **Import GitHub Repository**
   - Select "watchbiz" repository
   - Click "Import"

3. **Configure Project**
   ```
   Project Name: watchbiz
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables** (à cette étape, skip - on configurera après)

5. **Deploy** (first deployment pour setup)

### Option 2: Via Vercel CLI

```bash
# Login to Vercel
vercel login

# Link project
cd watchbiz
vercel link

# Follow prompts:
# ? Set up and deploy "watchbiz"? Y
# ? Which scope? [Your Account]
# ? Link to existing project? N
# ? What's your project's name? watchbiz
# ? In which directory is your code located? ./

# Get project info
vercel project ls
```

### 4. Get Vercel Tokens & IDs

**Pour GitHub Actions, récupérez:**

```bash
# Method 1: Via Vercel CLI
vercel project ls
# Note: VERCEL_PROJECT_ID

vercel teams ls
# Note: VERCEL_ORG_ID (team_xxx)

# Method 2: Via Web UI
# Project Settings → General
# - Project ID: prj_xxxxx
# - Team ID: team_xxxxx

# Create Vercel Token
# Account Settings → Tokens → Create Token
# Scope: Full Account
# Expiration: No Expiration (ou 1 an)
# Copy token: VERCEL_TOKEN
```

---

## 🗄️ Setup PostgreSQL Database

### Option A: Vercel Postgres (Recommandé)

```bash
# Via Vercel Dashboard
1. Open your project
2. Storage → Create Database → Postgres
3. Select region (closest to users)
4. Copy connection strings

# Automatic env vars injected:
POSTGRES_URL
POSTGRES_PRISMA_URL  # ← Use this for DATABASE_URL
POSTGRES_URL_NON_POOLING
```

### Option B: Neon (Free Tier)

1. **Create account**: https://neon.tech
2. **Create project**: "WatchBiz Production"
3. **Get connection string**:
   ```
   postgresql://user:password@ep-xxx.neon.tech/watchbiz?sslmode=require
   ```
4. **Copy as DATABASE_URL**

### Option C: Railway

1. **Create account**: https://railway.app
2. **New Project → Provision PostgreSQL**
3. **Variables → Copy DATABASE_URL**

### Run Migrations

```bash
# Set DATABASE_URL locally
export DATABASE_URL="postgresql://..."

# Run migrations
npx prisma migrate deploy

# Verify
npx prisma migrate status

# Seed database (optionnel)
npx prisma db seed
```

---

## 🔐 Configure GitHub Secrets

### Via GitHub Web UI

**GitHub → Settings → Secrets and variables → Actions → New repository secret**

#### Secrets à Ajouter

| Secret Name | Value | Where to Get |
|-------------|-------|--------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Neon/Vercel/Railway dashboard |
| `VERCEL_TOKEN` | `xxx...` | Vercel → Account → Tokens |
| `VERCEL_ORG_ID` | `team_xxx` | Vercel → Project → Settings |
| `VERCEL_PROJECT_ID` | `prj_xxx` | Vercel → Project → Settings |
| `CODECOV_TOKEN` | `xxx...` | Codecov.io → Repo Settings |

#### Optional Secrets

| Secret Name | Value | Usage |
|-------------|-------|-------|
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | Deployment notifications |
| `PRODUCTION_URL` | `https://watchbiz.vercel.app` | Smoke tests override |

### Via GitHub CLI

```bash
# Login to GitHub
gh auth login

# Set secrets
gh secret set DATABASE_URL --body "postgresql://..."
gh secret set VERCEL_TOKEN --body "xxx..."
gh secret set VERCEL_ORG_ID --body "team_xxx"
gh secret set VERCEL_PROJECT_ID --body "prj_xxx"
gh secret set CODECOV_TOKEN --body "xxx..."

# Verify secrets
gh secret list
```

---

## 🌐 Configure Vercel Environment Variables

### Via Vercel Dashboard

**Project → Settings → Environment Variables**

#### Production Environment

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | `postgresql://...` | ✅ Production |
| `NEXTAUTH_URL` | `https://watchbiz.vercel.app` | ✅ Production |
| `NEXTAUTH_SECRET` | `[Generate 32+ chars]` | ✅ Production, Preview |
| `STRIPE_SECRET_KEY` | `sk_live_...` | ✅ Production |
| `STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | ✅ Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | ✅ Production |
| `RESEND_API_KEY` | `re_...` (optionnel) | ✅ Production |

#### Preview/Development Environment

| Variable | Value | Environments |
|----------|-------|--------------|
| `DATABASE_URL` | `postgresql://..._dev` | ✅ Preview, Development |
| `NEXTAUTH_URL` | `http://localhost:3000` | ✅ Development |
| `STRIPE_SECRET_KEY` | `sk_test_...` | ✅ Preview, Development |
| `STRIPE_PUBLISHABLE_KEY` | `pk_test_...` | ✅ Preview, Development |

### Generate NEXTAUTH_SECRET

```bash
# Method 1: OpenSSL
openssl rand -base64 32

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: Online (NOT recommended for production)
# https://generate-secret.vercel.app/32
```

### Via Vercel CLI

```bash
# Set production env var
vercel env add DATABASE_URL production

# Set all environments
vercel env add NEXTAUTH_SECRET production preview development

# Pull env vars locally
vercel env pull .env.local
```

---

## 💳 Setup Stripe Webhooks

### Production Webhook

1. **Stripe Dashboard → Developers → Webhooks**
2. **Add endpoint**:
   ```
   Endpoint URL: https://watchbiz.vercel.app/api/webhooks/stripe
   Events to send:
     ✅ checkout.session.completed
     ✅ payment_intent.succeeded
     ✅ payment_intent.payment_failed
   ```
3. **Reveal signing secret**: `whsec_xxx`
4. **Add to Vercel env vars**: `STRIPE_WEBHOOK_SECRET`

### Local Development Webhook

```bash
# Install Stripe CLI
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook signing secret
# > Ready! Your webhook signing secret is whsec_xxx

# Add to .env.local
echo "STRIPE_WEBHOOK_SECRET=whsec_xxx" >> .env.local
```

### Test Webhook

```bash
# Trigger test event
stripe trigger checkout.session.completed

# Check logs
stripe listen --print-json
```

---

## 🚀 First Deployment

### Automated Deployment (Recommended)

```bash
# 1. Merge code to main
git checkout main
git merge develop
git push origin main

# 2. GitHub Actions automatically:
#    - Runs CI tests
#    - Deploys to Vercel
#    - Runs migrations
#    - Runs smoke tests

# 3. Monitor deployment
gh run list --workflow=deploy.yml
gh run watch
```

### Manual Deployment via Vercel

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check deployment status
vercel ls
```

---

## ✅ Verification

### 1. Check Deployment Status

```bash
# Via GitHub Actions
gh run list --workflow=deploy.yml
gh run view <run-id>

# Via Vercel
vercel ls
vercel inspect <deployment-url>
```

### 2. Verify Database Connection

```bash
# SSH into Vercel (if needed)
# Or check deployment logs

# Via local connection
DATABASE_URL="postgresql://..." npx prisma migrate status
```

### 3. Test Critical Endpoints

```bash
# Homepage
curl https://watchbiz.vercel.app

# API health check (create one if needed)
curl https://watchbiz.vercel.app/api/health

# Stripe webhook
curl -X POST https://watchbiz.vercel.app/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"checkout.session.completed"}'
# Should return 400 (invalid signature) - proves endpoint works
```

### 4. Run Smoke Tests

```bash
# Manual smoke test
npm run test:e2e -- tests/e2e/simple-smoke.spec.ts

# Set production URL
PLAYWRIGHT_TEST_BASE_URL=https://watchbiz.vercel.app npm run test:e2e
```

---

## 🐛 Troubleshooting

### Deployment Fails: Build Error

**Symptom:**
```
Error: Build failed
> Build error occurred
```

**Solutions:**

1. **Check build logs locally:**
   ```bash
   npm run build
   ```

2. **Verify environment variables:**
   ```bash
   vercel env ls
   ```

3. **Check Prisma generation:**
   ```bash
   npx prisma generate
   ```

### Database Connection Error

**Symptom:**
```
Error: Can't reach database server at `xxx`
```

**Solutions:**

1. **Verify DATABASE_URL format:**
   ```bash
   # Should be:
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
   ```

2. **Check database is accessible:**
   ```bash
   psql "postgresql://..." -c "SELECT 1"
   ```

3. **Whitelist Vercel IPs** (if using IP whitelist):
   - Vercel uses dynamic IPs - use 0.0.0.0/0 or Vercel Postgres

### Webhook Not Working

**Symptom:**
```
Stripe webhook returns 400/500
```

**Solutions:**

1. **Verify webhook URL:**
   ```
   https://YOUR_DOMAIN.vercel.app/api/webhooks/stripe
   (NOT http, NOT localhost)
   ```

2. **Check signing secret:**
   ```bash
   # Should start with whsec_
   vercel env ls | grep STRIPE_WEBHOOK_SECRET
   ```

3. **Test locally with Stripe CLI:**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   stripe trigger checkout.session.completed
   ```

### Prisma Migration Fails

**Symptom:**
```
Error: Migration failed to apply
```

**Solutions:**

1. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

2. **Resolve failed migration:**
   ```bash
   npx prisma migrate resolve --applied "migration_name"
   ```

3. **Reset database (⚠️ DELETES DATA):**
   ```bash
   npx prisma migrate reset
   ```

---

## 📝 Checklist Finale

### Pre-Production

- [ ] ✅ Code pushed to GitHub
- [ ] ✅ Vercel project created & linked
- [ ] ✅ PostgreSQL database provisioned
- [ ] ✅ GitHub Secrets configured (6 secrets)
- [ ] ✅ Vercel env vars configured (8+ variables)
- [ ] ✅ Stripe webhook configured
- [ ] ✅ Database migrated (`prisma migrate deploy`)
- [ ] ✅ NEXTAUTH_SECRET generated (32+ chars)
- [ ] ✅ Production Stripe keys used

### Post-Production

- [ ] ✅ Deployment successful
- [ ] ✅ Smoke tests passed
- [ ] ✅ Custom domain configured (optionnel)
- [ ] ✅ SSL certificate active
- [ ] ✅ Error tracking setup (Sentry)
- [ ] ✅ Database backups configured
- [ ] ✅ Monitoring active
- [ ] ✅ Team notified

---

## 🔄 Maintenance Tasks

### Weekly

```bash
# Check deployment health
vercel ls

# Review failed deployments
gh run list --workflow=deploy.yml --status=failure

# Check database size
# Via provider dashboard
```

### Monthly

```bash
# Rotate NEXTAUTH_SECRET
# 1. Generate new secret
# 2. Update Vercel env var
# 3. Redeploy

# Review Vercel analytics
vercel analytics

# Check database backups
# Via provider dashboard
```

### Quarterly

```bash
# Rotate all secrets
# - DATABASE_URL password
# - Stripe API keys
# - Vercel tokens

# Review costs
vercel billing
```

---

## 🆘 Support Resources

### Documentation

- **Vercel Deployment**: https://vercel.com/docs/deployments
- **Next.js on Vercel**: https://nextjs.org/learn/basics/deploying-nextjs-app
- **Prisma Production**: https://www.prisma.io/docs/guides/deployment
- **Stripe Webhooks**: https://stripe.com/docs/webhooks

### CLI Help

```bash
vercel --help
gh workflow --help
stripe --help
prisma --help
```

### Contact

- **Issues**: https://github.com/YOUR_USERNAME/watchbiz/issues
- **Vercel Support**: https://vercel.com/support
- **Stripe Support**: https://support.stripe.com

---

**Dernière mise à jour:** 2026-02-10
**Version:** 1.0.0
