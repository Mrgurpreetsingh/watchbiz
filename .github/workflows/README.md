# GitHub Actions Workflows

Ce dossier contient tous les workflows CI/CD pour WatchBiz.

## 📋 Table des Matières

- [Workflows Disponibles](#workflows-disponibles)
- [Configuration Requise](#configuration-requise)
- [Secrets GitHub](#secrets-github)
- [Variables d'Environnement](#variables-denvironnement)
- [Utilisation](#utilisation)
- [Troubleshooting](#troubleshooting)

---

## 🔄 Workflows Disponibles

### 1. **CI - Tests & Build** (`ci.yml`)

**Triggers:**
- Push sur `main` ou `develop`
- Pull Requests vers `main` ou `develop`

**Jobs:**
1. **Unit & Integration Tests** (15 min)
   - Setup PostgreSQL service
   - Run unit tests (68 tests)
   - Run integration tests (21 tests)
   - Generate coverage report
   - Upload to Codecov

2. **Lint & Type Check** (10 min)
   - ESLint validation
   - TypeScript compilation check

3. **Build Verification** (20 min)
   - Next.js production build
   - Archive build artifacts

4. **Security Audit** (10 min)
   - `npm audit` for vulnerabilities
   - Check outdated dependencies

5. **Prisma Validation** (5 min)
   - Schema validation
   - Format check
   - Migration diff check

6. **All Checks Passed**
   - Summary of all job results
   - Fails if any critical job fails

**Durée Totale:** ~15-20 minutes (jobs en parallèle)

---

### 2. **E2E Tests - Playwright** (`e2e.yml`)

**Triggers:**
- Push sur `main` ou `develop`
- Pull Requests
- Manuel (`workflow_dispatch`)

**Jobs:**
1. **E2E Tests (Matrix)** (30 min)
   - Browsers: Chromium, Firefox, WebKit
   - Setup PostgreSQL for E2E
   - Build Next.js app
   - Run Playwright tests
   - Upload reports & screenshots

2. **E2E Summary**
   - Aggregate results across browsers
   - Comment on PR with results

3. **Visual Regression** (20 min)
   - Only on `main`/`develop`
   - Chromium snapshots
   - Compare with baseline

**Durée Totale:** ~30-40 minutes

---

### 3. **Deploy to Production** (`deploy.yml`)

**Triggers:**
- Push sur `main`
- Manuel avec sélection d'environnement

**Jobs:**
1. **Pre-deployment Checks** (10 min)
   - Lint, TypeCheck, Prisma validation
   - Environment variables check

2. **Deploy to Vercel** (20 min)
   - Pull Vercel config
   - Build artifacts
   - Deploy to production/staging
   - Comment PR with preview URL

3. **Migrate Database** (10 min)
   - Run Prisma migrations on production DB
   - Only for production deployments

4. **Post-deploy Smoke Tests** (15 min)
   - Run smoke tests against deployed URL
   - Verify critical pages load

5. **Notify Deployment**
   - Create deployment summary
   - Optional: Slack notification

6. **Rollback** (10 min)
   - Auto-rollback on smoke test failure
   - Only for production

**Durée Totale:** ~40-50 minutes

---

## 🔧 Configuration Requise

### GitHub Repository Settings

1. **Branch Protection Rules** (recommandé)
   - Require status checks to pass:
     - `Unit & Integration Tests`
     - `Lint & Type Check`
     - `Build Application`
   - Require pull request reviews
   - Require branches to be up to date

2. **Actions Settings**
   - Enable "Allow GitHub Actions to create and approve pull requests" (pour auto-comments)
   - Workflow permissions: Read and write permissions

---

## 🔐 Secrets GitHub

### Configuration via GitHub UI

**Settings → Secrets and variables → Actions → New repository secret**

#### Secrets Requis

| Secret | Description | Où l'obtenir |
|--------|-------------|--------------|
| `DATABASE_URL` | Production database URL | Provider PostgreSQL (Vercel/Railway/Neon) |
| `CODECOV_TOKEN` | Coverage reporting token | https://codecov.io |
| `VERCEL_TOKEN` | Vercel deployment token | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | Vercel organization ID | Vercel project settings |
| `VERCEL_PROJECT_ID` | Vercel project ID | Vercel project settings |

#### Secrets Optionnels

| Secret | Description | Utilisation |
|--------|-------------|-------------|
| `SLACK_WEBHOOK_URL` | Slack notifications | Deployment alerts |
| `SENTRY_AUTH_TOKEN` | Sentry integration | Error tracking |
| `PRODUCTION_URL` | Production URL override | Smoke tests |

---

## 🌍 Variables d'Environnement

### Définies dans les Workflows

Les workflows définissent automatiquement ces variables:

```yaml
DATABASE_URL=postgresql://watchbiz_test:test_password@localhost:5432/watchbiz_test
NEXTAUTH_SECRET=test_secret_min_32_characters_long_string_for_ci
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_mock
STRIPE_WEBHOOK_SECRET=whsec_test_mock
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

### Configuration Vercel

Définissez ces variables sur Vercel (Settings → Environment Variables):

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY` (optionnel)

---

## 🚀 Utilisation

### Workflow Automatique

1. **Créer une Pull Request**
   ```bash
   git checkout -b feature/my-feature
   git commit -m "Add feature"
   git push origin feature/my-feature
   # Create PR on GitHub
   ```

2. **CI runs automatiquement**
   - Unit/Integration tests
   - E2E tests (si activés)
   - Build verification
   - Linting & TypeCheck

3. **Merge vers `develop`**
   - Tous les tests run à nouveau
   - Optionnel: Déploiement sur staging

4. **Merge vers `main`**
   - CI complet
   - Déploiement automatique sur production
   - Migration DB
   - Smoke tests

### Déploiement Manuel

**Via GitHub UI:**

1. Actions → Deploy to Production
2. Click "Run workflow"
3. Select environment (production/staging)
4. Click "Run workflow"

**Via GitHub CLI:**

```bash
# Deploy to production
gh workflow run deploy.yml -f environment=production

# Deploy to staging
gh workflow run deploy.yml -f environment=staging
```

---

## 📊 Monitoring & Reports

### Coverage Reports

- **Codecov Dashboard**: https://codecov.io/gh/YOUR_ORG/watchbiz
- Coverage badge: Ajoutez à README.md:
  ```markdown
  [![codecov](https://codecov.io/gh/YOUR_ORG/watchbiz/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_ORG/watchbiz)
  ```

### Playwright Reports

- Téléchargeables depuis "Actions" tab → Artifacts
- Inclut screenshots et vidéos des échecs

### Deployment Logs

- GitHub Actions Summary
- Vercel Dashboard

---

## 🐛 Troubleshooting

### Tests Échouent en CI mais Passent Localement

**Causes communes:**

1. **Variables d'environnement manquantes**
   ```bash
   # Vérifiez le log "Setup test environment"
   # Ajoutez les secrets manquants sur GitHub
   ```

2. **Database connection issues**
   ```bash
   # Le service PostgreSQL prend du temps à démarrer
   # Solution: Augmenter health-retries dans ci.yml
   ```

3. **Timeouts Playwright**
   ```bash
   # CI peut être plus lent que local
   # Solution: Augmenter timeout dans playwright.config.ts
   ```

### Déploiement Échoue

**Rollback manuel:**

```bash
# Via Vercel CLI
vercel rollback <deployment-url>

# Via Vercel Dashboard
Deployments → Previous deployment → Promote to Production
```

**Vérifier les logs:**

```bash
# GitHub Actions logs
# OU
vercel logs <deployment-url>
```

### Coverage Report Non Uploadé

**Vérifiez:**

1. `CODECOV_TOKEN` est défini dans GitHub Secrets
2. Votre repo est ajouté sur Codecov.io
3. Le fichier `coverage/lcov.info` est généré

---

## 📝 Best Practices

### Pour les Développeurs

1. **Run tests localement avant push**
   ```bash
   npm run test:unit
   npm run test:integration
   npm run test:e2e
   ```

2. **Vérifier le build**
   ```bash
   npm run build
   ```

3. **Linting & TypeCheck**
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

### Pour les Mainteneurs

1. **Réviser les PRs avec tests passants** (green checkmark)
2. **Vérifier coverage** ne descend pas en dessous de 70%
3. **Surveiller les temps d'exécution** des workflows
4. **Nettoyer les artifacts** régulièrement (GitHub → Settings → Actions → Storage)

---

## 🔄 Workflow Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│  Developer Push → GitHub                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  CI Workflow (ci.yml)                                        │
│  • Unit Tests (15min)                                        │
│  • Integration Tests                                         │
│  • Lint & TypeCheck (10min)                                 │
│  • Build (20min)                                             │
│  • Security Audit (10min)                                    │
│  • Prisma Validation (5min)                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  E2E Workflow (e2e.yml)                                      │
│  • Playwright Tests (30min)                                  │
│  • Multi-browser (Chromium, Firefox, WebKit)                │
│  • Visual Regression (optional)                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
          ┌───────────────┴───────────────┐
          │  All Checks Pass?             │
          └───────────────┬───────────────┘
                    ✅ Yes │ ❌ No
                          │
      ┌───────────────────┴───────────────┐
      │                                   │
   [Merge]                          [Fix & Retry]
      │
      ↓ (to main branch)
┌─────────────────────────────────────────────────────────────┐
│  Deploy Workflow (deploy.yml)                                │
│  • Pre-deployment Checks (10min)                             │
│  • Vercel Deployment (20min)                                 │
│  • Database Migration (10min)                                │
│  • Smoke Tests (15min)                                       │
│  • Notification                                              │
│  • Rollback on Failure (if needed)                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
                   🎉 PRODUCTION
```

---

## 🆘 Support

**Problème avec CI/CD?**

1. Consultez les logs GitHub Actions
2. Vérifiez cette documentation
3. Ouvrez une issue: `[CI] Description du problème`
4. Contactez l'équipe DevOps

**Ressources Utiles:**

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs/deployments)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Codecov Documentation](https://docs.codecov.com)
