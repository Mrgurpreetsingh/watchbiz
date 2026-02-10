#!/usr/bin/env tsx
/**
 * 💾 Script de Backup PostgreSQL automatique
 *
 * Crée une sauvegarde complète de la base de données
 * avec horodatage pour éviter les écrasements
 */

import 'dotenv/config'
import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir } from 'fs/promises'
import { join } from 'path'

const execAsync = promisify(exec)

// Configuration
const BACKUP_DIR = join(process.cwd(), 'backups')
const DATABASE_URL = process.env.DATABASE_URL || ''

// Parser l'URL PostgreSQL
function parsePostgresUrl(url: string) {
  // Supporte avec ou sans mot de passe
  const match = url.match(/postgresql:\/\/([^:@]+)(?::([^@]+))?@([^:]+):(\d+)\/([^?]+)/)
  if (!match) {
    console.error('Failed to parse DATABASE_URL:', url)
    throw new Error('Invalid DATABASE_URL format')
  }

  return {
    user: match[1],
    password: match[2] || '', // Mot de passe optionnel
    host: match[3],
    port: match[4],
    database: match[5],
  }
}

async function backup() {
  console.log('💾 Starting database backup...\n')

  try {
    // Créer le dossier backups s'il n'existe pas
    await mkdir(BACKUP_DIR, { recursive: true })

    // Parser l'URL de connexion
    const dbConfig = parsePostgresUrl(DATABASE_URL)

    // Nom du fichier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `watchbiz_backup_${timestamp}.sql`
    const filepath = join(BACKUP_DIR, filename)

    console.log(`📁 Backup directory: ${BACKUP_DIR}`)
    console.log(`📄 Backup file: ${filename}`)
    console.log(`🗄️  Database: ${dbConfig.database}`)
    console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}\n`)

    // Commande pg_dump
    const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -F c -f "${filepath}"`

    // Définir le mot de passe via variable d'environnement
    const env = { ...process.env, PGPASSWORD: dbConfig.password }

    console.log('⏳ Creating backup...')
    await execAsync(command, { env })

    console.log('✅ Backup created successfully!')
    console.log(`📦 File: ${filepath}`)

    // Lister tous les backups
    console.log('\n📋 Available backups:')
    const { stdout } = await execAsync(`ls -lh "${BACKUP_DIR}"`)
    console.log(stdout)

    console.log('\n💡 To restore this backup, run:')
    console.log(`   npm run db:restore ${filename}`)

  } catch (error) {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  }
}

// Lancer le backup
backup()
