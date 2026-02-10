# CI/CD Pipeline - WatchBiz

## 📖 Overview

Ce document décrit l'infrastructure complète de CI/CD (Continuous Integration / Continuous Deployment) pour WatchBiz, incluant les tests automatisés, le déploiement et le monitoring.

---

## 🏗️ Architecture Globale

```
┌──────────────────────────────────────────────────────────────────┐
│                         GitHub Repository                         │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │   main     │  │  develop   │  │  feature/* │                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflows                       │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  CI Workflow │  │ E2E Workflow │  │Deploy Workflow│          │
│  │              │  │              │  │              │           │
│  │ • Unit Tests │  │ • Playwright │  │ • Pre-checks │           │
│  │ • Integration│  │ • Multi-     │  │ • Vercel     │           │
│  │ • Lint       │  │   browser    │  │ • Migrations │           │
│  │ • Build      │  │ • Visual     │  │ • Smoke Tests│           │
│  │ • Security   │  │              │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
└──────────────────────────────────────────────────────────────────┘
                            ↓
┌──────────────────────────────────────────────────────────────────┐
│                    External Services                              │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │
│  │  Codecov   │  │   Vercel   │  │ PostgreSQL │                 │
│  │ (Coverage) │  │  (Deploy)  │  │  (Database)│                 │
│  └────────────┘  └────────────┘  └────────────┘                 │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Workflows Détaillés

### 1. CI Workflow (`ci.yml`)

**Objectif:** Valider chaque changement de code avant merge.

#### Jobs en Parallèle

```yaml
┌─────────────────────────────────────────────────────────────┐
│  Job 1: Unit & Integration Tests                            │
│  ────────────────────────────────────────────────────────   │
│  • Setup PostgreSQL service (port 5432)                     │
│  • Install dependencies (npm ci)                            │
│  • Generate Prisma Client                                   │
│  • Run migrations                                           │
│  • Execute 68 unit tests (Vitest)                           │
│  • Execute 21 integration tests                             │
│  • Generate coverage report (lcov, html, json)              │
│  • Upload to Codecov                                        │
│  • Archive test results                                     │
│                                                             │
│  Duration: ~15 minutes                                      │
│  Timeout: 15 minutes                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Job 2: Lint & Type Check                                   │
│  ────────────────────────────────────────────────────────   │
│  • ESLint validation                                        │
│  • TypeScript compilation check (tsc --noEmit)              │
│                                                             │
│  Duration: ~10 minutes                                      │
│  Timeout: 10 minutes                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Job 3: Build Verification                                   │
│  ────────────────────────────────────────────────────────   │
│  • Next.js production build                                 │
│  • Verify no build errors                                  │
│  • Archive .next/ artifacts                                 │
│                                                             │
│  Duration: ~20 minutes                                      │
│  Timeout: 20 minutes                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Job 4: Security Audit                                       │
│  ────────────────────────────────────────────────────────   │
│  • npm audit --audit-level=high                             │
│  • Check outdated dependencies                              │
│                                                             │
│  Duration: ~10 minutes                                      │
│  Timeout: 10 minutes                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Job 5: Prisma Validation                                    │
│  ────────────────────────────────────────────────────────   │
│  • npx prisma validate                                      │
│  • npx prisma format --check                                │
│  • Check for pending migrations                             │
│                                                             │
│  Duration: ~5 minutes                                       │
│  Timeout: 5 minutes                                         │
└─────────────────────────────────────────────────────────────┘
```

#### Coverage Thresholds

| Catégorie | Threshold | Fichiers Critiques |
|-----------|-----------|-------------------|
| **Global** | 70% | Tout le projet |
| **Authentication** | 85% | `actions/auth.ts`, `lib/auth.ts` |
| **Checkout** | 85% | `actions/checkout.ts` |
| **Webhooks** | 80% | `app/api/webhooks/stripe/route.ts` |
| **Admin** | 80% | `actions/admin-*.ts` |

---

### 2. E2E Workflow (`e2e.yml`)

**Objectif:** Tester les user journeys complets dans des navigateurs réels.

#### Browser Matrix

Tests exécutés sur 3 navigateurs:

1. **Chromium** (Chrome/Edge)
2. **Firefox**
3. **WebKit** (Safari)

#### E2E Test Suites

```typescript
tests/e2e/
├── simple-smoke.spec.ts         // ✅ 4 tests passing
│   ├── Homepage load
│   ├── Cart page
│   ├── Brands page
│   └── About page
│
├── user-journeys/
│   ├── guest-checkout.spec.ts   // Browse → Cart → Checkout
│   └── registered-checkout.spec.ts  // Login → Cart → Checkout
│
└── admin/
    └── product-management.spec.ts   // CRUD operations
```

#### Artifacts Générés

- **HTML Reports** (playwright-report/)
- **Screenshots** (test-results/**/*.png)
- **Videos** (test-results/**/*.webm)
- **Traces** (pour debugging)

---

### 3. Deploy Workflow (`deploy.yml`)

**Objectif:** Déployer automatiquement sur production/staging avec validations.

#### Déploiement Flow

```
1. Pre-deployment Checks (10 min)
   ├── Lint validation
   ├── TypeScript check
   ├── Prisma validation
   └── Environment variables check
          ↓
2. Deploy to Vercel (20 min)
   ├── Pull Vercel config
   ├── Build project artifacts
   ├── Deploy (production or staging)
   └── Get deployment URL
          ↓
3. Database Migration (10 min)
   ├── npx prisma migrate deploy
   └── Verify migration status
          ↓
4. Post-deploy Smoke Tests (15 min)
   ├── Run simple-smoke.spec.ts
   ├── Against deployed URL
   └── Verify critical pages load
          ↓
5. Notify Deployment
   ├── Create GitHub summary
   ├── Comment on PR/commit
   └── Optional: Slack notification
          ↓
   ┌──────────┐
   │  Success │──→ ✅ PRODUCTION
   └──────────┘
          │
   ┌──────────┐
   │  Failure │──→ ❌ Rollback (auto)
   └──────────┘
```

---

## 🔐 Secrets & Variables

### GitHub Secrets à Configurer

**Obligatoires:**

```bash
DATABASE_URL          # Production PostgreSQL URL
CODECOV_TOKEN         # Codecov.io token
VERCEL_TOKEN          # Vercel API token
VERCEL_ORG_ID         # Vercel organization ID
VERCEL_PROJECT_ID     # Vercel project ID
```

**Optionnels:**

```bash
SLACK_WEBHOOK_URL     # Notifications Slack
PRODUCTION_URL        # Override production URL for smoke tests
SENTRY_AUTH_TOKEN     # Sentry error tracking
```

### Configuration via CLI

```bash
# Add GitHub secret
gh secret set DATABASE_URL --body "postgresql://..."

# List all secrets
gh secret list

# Vercel tokens (get from vercel.com/account/tokens)
gh secret set VERCEL_TOKEN --body "..."
gh secret set VERCEL_ORG_ID --body "..."
gh secret set VERCEL_PROJECT_ID --body "..."
```

---

## 📊 Monitoring & Reports

### Codecov Dashboard

**URL:** https://codecov.io/gh/YOUR_ORG/watchbiz

**Métriques Suivies:**

- Global coverage (target: 70%)
- PR diff coverage (target: 75%)
- Component-level coverage (auth, checkout, admin)
- Trends over time

**Badges pour README:**

```markdown
[![codecov](https://codecov.io/gh/YOUR_ORG/watchbiz/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_ORG/watchbiz)
```

### GitHub Actions Summary

Chaque workflow génère un résumé visible dans:

**GitHub → Actions → [Workflow Name] → Summary**

Exemple de summary:

```
✅ All Checks Passed

| Job                      | Status  | Duration |
|--------------------------|---------|----------|
| Unit & Integration Tests | ✅      | 14m 32s  |
| Lint & Type Check        | ✅      | 8m 15s   |
| Build Application        | ✅      | 18m 47s  |
| Security Audit           | ⚠️      | 5m 12s   |
| Prisma Validation        | ✅      | 3m 28s   |

Coverage: 72.4% (+1.2%)
```

---

## 🐛 Troubleshooting

### Tests Échouent en CI mais Passent Localement

#### Cause 1: Variables d'Environnement

```bash
# Vérifiez les logs "Setup test environment"
# Comparez avec .env.test local

# Solution:
gh secret set VARIABLE_NAME --body "value"
```

#### Cause 2: PostgreSQL Service

```yaml
# Dans ci.yml, augmentez health-retries si timeout
services:
  postgres:
    options: >-
      --health-retries 10  # Au lieu de 5
```

#### Cause 3: Race Conditions

```typescript
// Dans tests, ajoutez explicit waits
await page.waitForLoadState('networkidle')
await expect(locator).toBeVisible({ timeout: 10000 })
```

### Déploiement Échoue

#### Rollback Manuel

```bash
# Via Vercel CLI
vercel rollback <deployment-url>

# Via GitHub Actions (manual trigger)
gh workflow run deploy.yml -f environment=production
```

#### Vérifier Migration Status

```bash
# Localement avec production DB
DATABASE_URL="postgresql://..." npx prisma migrate status

# Fix migration issues
npx prisma migrate resolve --applied "migration_name"
```

### Coverage Report Non Uploadé

```bash
# Vérifiez que coverage/lcov.info existe
ls -la coverage/

# Vérifiez CODECOV_TOKEN dans GitHub Secrets
gh secret list | grep CODECOV

# Testez upload localement
bash <(curl -s https://codecov.io/bash) -t YOUR_TOKEN
```

---

## 🚀 Utilisation Quotidienne

### Développeur: Créer une Feature

```bash
# 1. Créer branche
git checkout -b feature/my-feature

# 2. Développer + tests locaux
npm run test:unit
npm run test:integration

# 3. Commit & push
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature

# 4. Créer PR sur GitHub
# CI runs automatiquement:
#   - Unit tests
#   - Integration tests
#   - Lint & TypeCheck
#   - Build
#   - E2E tests (optionnel)

# 5. Attendre green checkmark ✅

# 6. Merge vers develop
# CI re-runs + optional staging deploy

# 7. Merge develop → main (release)
# Full CI + Production deployment
```

### Mainteneur: Déploiement Production

```bash
# Option 1: Automatique (push to main)
git checkout main
git merge develop
git push origin main
# Déploiement auto déclenché

# Option 2: Manuel
gh workflow run deploy.yml -f environment=production

# Vérifier deployment
gh run list --workflow=deploy.yml
gh run view <run-id>

# Rollback si problème
vercel rollback <deployment-url>
```

---

## 📈 Métriques de Performance

### Durées Typiques (CI)

| Workflow | Durée Normale | Timeout Max |
|----------|---------------|-------------|
| CI (tous jobs) | 15-20 min | 30 min |
| E2E Tests | 30-40 min | 50 min |
| Deployment | 40-50 min | 60 min |

### Optimisations

1. **Cache npm dependencies**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       cache: 'npm'  # ✅ 2-3 min saved
   ```

2. **Parallel jobs**
   ```yaml
   # Lint et Build en parallèle (au lieu de séquentiel)
   # Économie: ~10 min
   ```

3. **Playwright browsers cache**
   ```yaml
   # Browsers installés 1x, réutilisés
   # Économie: ~5 min
   ```

---

## 🔄 Maintenance

### Tâches Hebdomadaires

- [ ] Vérifier coverage trends (Codecov)
- [ ] Nettoyer artifacts GitHub (>1 mois)
- [ ] Review failed workflows (alertes)

### Tâches Mensuelles

- [ ] Update dependencies (`npm outdated`)
- [ ] Review workflow performance
- [ ] Optimize slow tests
- [ ] Update documentation

### Tâches Trimestrielles

- [ ] Rotate secrets (DATABASE_URL, tokens)
- [ ] Review branch protection rules
- [ ] Audit security vulnerabilities
- [ ] Update GitHub Actions versions

---

## 📚 Ressources

### Documentation Officielle

- [GitHub Actions](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Codecov Docs](https://docs.codecov.com)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### Scripts Utiles

```bash
# Vérifier variables d'environnement
./scripts/check-env.sh

# Setup DB test locale
./scripts/ci-setup-db.sh

# Cleanup DB test
./scripts/ci-cleanup-db.sh
```

### Contact

- **DevOps Team:** devops@watchbiz.com
- **Issues CI/CD:** Prefix avec `[CI]`
- **Slack:** #ci-cd-support

---

## ✅ Checklist avant Production

### Pre-deployment

- [ ] Tous les tests passent (89 tests)
- [ ] Coverage ≥ 70% global
- [ ] Aucune vulnerability haute/critique
- [ ] Prisma migrations reviewed
- [ ] Environment variables configurées (Vercel)
- [ ] DATABASE_URL production set
- [ ] NEXTAUTH_SECRET généré (32+ chars)
- [ ] Stripe production keys configurées

### Post-deployment

- [ ] Smoke tests passent sur production
- [ ] Migration DB réussie
- [ ] Vercel deployment URL accessible
- [ ] SSL/HTTPS fonctionnel
- [ ] Error tracking configuré (Sentry)
- [ ] Monitoring actif
- [ ] Backup DB configuré
- [ ] Rollback plan tested

---

**Dernière mise à jour:** 2026-02-10
**Version:** 1.0.0
**Maintenu par:** DevOps Team
