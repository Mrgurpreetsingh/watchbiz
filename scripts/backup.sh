#!/bin/bash
# 💾 Script de backup automatique PostgreSQL
# Utilise pg_dump pour créer une sauvegarde complète

set -e

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="watchbiz_backup_${TIMESTAMP}.sql"

# Charger les variables d'environnement
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

# Parser l'URL PostgreSQL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in .env.local"
  exit 1
fi

# Créer le dossier backups
mkdir -p "$BACKUP_DIR"

echo "💾 Creating database backup..."
echo "📁 Directory: $BACKUP_DIR"
echo "📄 File: $BACKUP_FILE"
echo ""

# Créer le backup (format custom pour pg_restore)
pg_dump "$DATABASE_URL" -F c -f "$BACKUP_DIR/$BACKUP_FILE"

echo "✅ Backup created successfully!"
echo "📦 File: $BACKUP_DIR/$BACKUP_FILE"
echo ""
echo "💡 To restore: npm run db:restore $BACKUP_FILE"
