# Scripts CI/CD

Collection de scripts shell pour faciliter les opérations CI/CD, testing et deployment.

---

## 📋 Scripts Disponibles

### 🗄️ Database Scripts

#### `ci-setup-db.sh`

**Description:** Configure la base de données de test pour l'environnement CI.

**Usage:**
```bash
# Dans GitHub Actions (automatique)
./scripts/ci-setup-db.sh

# Localement
export DATABASE_URL="postgresql://test:test@localhost:5432/watchbiz_test"
./scripts/ci-setup-db.sh
```

**Actions:**
1. Vérifie que `DATABASE_URL` est défini
2. Génère le Prisma Client (`npx prisma generate`)
3. Exécute les migrations (`npx prisma migrate deploy`)
4. Vérifie le statut des migrations
5. Seed la DB si `SEED_DATABASE=true`

**Variables d'environnement:**
- `DATABASE_URL` (requis): Connection string PostgreSQL
- `SEED_DATABASE` (optionnel): `true` pour seed

**Exit codes:**
- `0`: Success
- `1`: DATABASE_URL non défini ou erreur

---

#### `ci-cleanup-db.sh`

**Description:** Nettoie la base de données après les tests CI.

**Usage:**
```bash
# Dans GitHub Actions (automatique en post-job)
./scripts/ci-cleanup-db.sh

# Localement (⚠️ ATTENTION: Reset DB)
export CI=true
./scripts/ci-cleanup-db.sh
```

**Actions:**
1. Vérifie que `DATABASE_URL` est défini
2. Reset la DB si `CI=true` (`npx prisma migrate reset --force`)
3. Skip si pas en environnement CI (sécurité)

**Variables d'environnement:**
- `DATABASE_URL` (optionnel): Connection string
- `CI` (requis pour reset): `true` pour activer le reset

**⚠️ Attention:**
- Reset DATABASE_URL complètement (SUPPRIME TOUTES LES DONNÉES)
- Seulement activé si `CI=true` (protection)

---

### 🔍 Validation Scripts

#### `check-env.sh`

**Description:** Vérifie que toutes les variables d'environnement requises sont définies.

**Usage:**
```bash
# Vérification complète
./scripts/check-env.sh

# Vérification avant déploiement
./scripts/check-env.sh && echo "Ready to deploy"
```

**Vérifie:**

**Variables Requises:**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

**Variables Optionnelles (warnings):**
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `CODECOV_TOKEN`
- `VERCEL_TOKEN`

**Output:**
```
🔍 Checking required environment variables...

📋 Required Variables:
  ✅ DATABASE_URL - Set
  ✅ NEXTAUTH_SECRET - Set
  ❌ STRIPE_SECRET_KEY - MISSING

📋 Optional Variables:
  ⚠️  RESEND_API_KEY - Not set
  ✅ CODECOV_TOKEN - Set

═══════════════════════════════════════
❌ Missing 1 required variable(s):
   - STRIPE_SECRET_KEY

Please set these variables in:
  - Local: .env.local or .env.test
  - CI: GitHub Secrets
  - Production: Vercel Environment Variables
```

**Exit codes:**
- `0`: All required variables set
- `1`: Missing required variables

---

## 🚀 Usage in CI/CD

### GitHub Actions Integration

Les scripts sont automatiquement appelés dans les workflows:

#### CI Workflow (`.github/workflows/ci.yml`)

```yaml
- name: Setup test environment
  run: |
    cp .env.example .env.test
    echo "DATABASE_URL=postgresql://..." >> .env.test
    # ... autres env vars

- name: Setup database
  run: ./scripts/ci-setup-db.sh
  env:
    DATABASE_URL: ${{ env.DATABASE_URL }}

# ... tests

- name: Cleanup
  if: always()
  run: ./scripts/ci-cleanup-db.sh
  env:
    CI: true
    DATABASE_URL: ${{ env.DATABASE_URL }}
```

#### Deploy Workflow (`.github/workflows/deploy.yml`)

```yaml
- name: Check environment variables
  run: ./scripts/check-env.sh
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
    # ... autres secrets
```

---

## 🔧 Development Usage

### Setup Local Test Database

```bash
# 1. Créer DB PostgreSQL locale
createdb watchbiz_test

# 2. Set environment
export DATABASE_URL="postgresql://user:password@localhost:5432/watchbiz_test"
export SEED_DATABASE=true

# 3. Run setup script
./scripts/ci-setup-db.sh

# Output:
# 🗄️  Setting up test database for CI...
# 📋 Database URL: postgresql://user:password@localhost:5432/watchbiz_test
# 🔧 Generating Prisma Client...
# 🚀 Running database migrations...
# ✅ Verifying migration status...
# 🌱 Seeding test database...
# ✅ Database setup complete!
```

### Verify Environment Before Deploy

```bash
# Load production env vars (example)
export DATABASE_URL="postgresql://prod..."
export NEXTAUTH_SECRET="..."
# ... autres vars

# Check all required vars are set
./scripts/check-env.sh

# Si success (exit 0), proceed with deployment
if [ $? -eq 0 ]; then
  echo "✅ Environment OK, deploying..."
  vercel --prod
else
  echo "❌ Missing environment variables, aborting"
fi
```

---

## 📝 Script Permissions

Les scripts doivent être exécutables:

```bash
# Check permissions
ls -la scripts/

# Make executable (if needed)
chmod +x scripts/*.sh

# Verify
./scripts/check-env.sh  # Should run without "bash" prefix
```

---

## 🐛 Troubleshooting

### "Permission denied" Error

```bash
# Error
./scripts/ci-setup-db.sh
-bash: ./scripts/ci-setup-db.sh: Permission denied

# Fix
chmod +x scripts/ci-setup-db.sh

# OR run with bash
bash scripts/ci-setup-db.sh
```

### "DATABASE_URL not set" Error

```bash
# Error
❌ ERROR: DATABASE_URL not set

# Fix: Set environment variable
export DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# OR create .env.test
echo "DATABASE_URL=postgresql://..." > .env.test
source .env.test
```

### "Prisma Client not generated" Error

```bash
# Error during migration
Error: @prisma/client did not initialize yet

# Fix: Run generate first
npx prisma generate

# OR re-run setup script (includes generate)
./scripts/ci-setup-db.sh
```

### Scripts Not Found in CI

```bash
# Error in GitHub Actions
./scripts/ci-setup-db.sh: not found

# Fix: Ensure scripts are committed to git
git add scripts/*.sh
git commit -m "Add CI scripts"
git push

# Verify in repository
ls -la scripts/
```

---

## 🔒 Security Notes

### Database Credentials

- ❌ **NEVER** hardcode credentials in scripts
- ✅ **ALWAYS** use environment variables
- ✅ Use different credentials for test/prod

### CI Environment

```bash
# Scripts check CI variable for destructive operations
if [ "$CI" = "true" ]; then
  # Safe to reset test database
  npx prisma migrate reset --force
fi
```

### Secret Exposure

```bash
# ❌ BAD: Prints secret in logs
echo "DATABASE_URL=$DATABASE_URL"

# ✅ GOOD: Masks secret
echo "DATABASE_URL is set: ${DATABASE_URL:0:10}..."
```

---

## 📚 Resources

### Bash Scripting

- [Bash Guide](https://mywiki.wooledge.org/BashGuide)
- [Shell Check](https://www.shellcheck.net/) - Linter pour scripts

### Prisma CLI

```bash
# Useful commands
npx prisma --help
npx prisma migrate --help
npx prisma db --help
```

### Environment Variables

```bash
# Print all env vars
printenv

# Print specific var
echo $DATABASE_URL

# Check if var is set
[ -z "$DATABASE_URL" ] && echo "Not set" || echo "Set"
```

---

## ✅ Testing Scripts Locally

### Test `ci-setup-db.sh`

```bash
# 1. Create test database
createdb watchbiz_ci_test

# 2. Set env
export DATABASE_URL="postgresql://localhost:5432/watchbiz_ci_test"

# 3. Run script
./scripts/ci-setup-db.sh

# 4. Verify
psql $DATABASE_URL -c "\dt"  # Should show tables

# 5. Cleanup
dropdb watchbiz_ci_test
```

### Test `check-env.sh`

```bash
# 1. Unset all vars
unset DATABASE_URL NEXTAUTH_SECRET

# 2. Run check (should fail)
./scripts/check-env.sh
# Expected: Exit code 1, missing variables listed

# 3. Set required vars
export DATABASE_URL="test"
export NEXTAUTH_SECRET="test"
export NEXTAUTH_URL="test"
export STRIPE_SECRET_KEY="test"
export STRIPE_PUBLISHABLE_KEY="test"
export STRIPE_WEBHOOK_SECRET="test"

# 4. Run check (should pass)
./scripts/check-env.sh
# Expected: Exit code 0, ✅ All required environment variables are set!
```

---

## 🔄 Maintenance

### Adding New Scripts

1. **Create script file:**
   ```bash
   touch scripts/my-new-script.sh
   chmod +x scripts/my-new-script.sh
   ```

2. **Add shebang and documentation:**
   ```bash
   #!/bin/bash
   # My New Script
   # Description of what it does

   set -e  # Exit on error

   echo "🚀 Running my script..."
   # ... script logic
   ```

3. **Test locally:**
   ```bash
   ./scripts/my-new-script.sh
   ```

4. **Document in this README**

5. **Commit:**
   ```bash
   git add scripts/my-new-script.sh scripts/README.md
   git commit -m "Add my-new-script.sh"
   ```

### Updating Existing Scripts

1. Make changes
2. Test thoroughly locally
3. Test in CI (via PR)
4. Update documentation
5. Commit and deploy

---

**Dernière mise à jour:** 2026-02-10
**Maintenu par:** DevOps Team
