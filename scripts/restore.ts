#!/usr/bin/env tsx
/**
 * 🔄 Script de Restore PostgreSQL
 *
 * Restaure une sauvegarde de la base de données
 * Usage: npm run db:restore [filename]
 */

import 'dotenv/config'
import { exec } from 'child_process'
import { promisify } from 'util'
import { readdir, access } from 'fs/promises'
import { join } from 'path'
import * as readline from 'readline'

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

// Demander confirmation
function askConfirmation(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
    })
  })
}

async function restore() {
  console.log('🔄 Database Restore Tool\n')

  try {
    // Récupérer le nom du fichier depuis les arguments
    const filename = process.argv[2]

    if (!filename) {
      // Lister les backups disponibles
      console.log('📋 Available backups:')
      const files = await readdir(BACKUP_DIR)
      const backups = files.filter((f) => f.endsWith('.sql'))

      if (backups.length === 0) {
        console.log('❌ No backups found in', BACKUP_DIR)
        console.log('💡 Create a backup first: npm run db:backup')
        process.exit(1)
      }

      backups.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`)
      })

      console.log('\n💡 Usage: npm run db:restore <filename>')
      console.log('   Example: npm run db:restore', backups[0])
      process.exit(0)
    }

    const filepath = join(BACKUP_DIR, filename)

    // Vérifier que le fichier existe
    try {
      await access(filepath)
    } catch {
      console.error('❌ Backup file not found:', filename)
      console.log('💡 Check available backups: npm run db:restore')
      process.exit(1)
    }

    // Parser l'URL de connexion
    const dbConfig = parsePostgresUrl(DATABASE_URL)

    console.log(`📄 Backup file: ${filename}`)
    console.log(`🗄️  Database: ${dbConfig.database}`)
    console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}\n`)

    // Demander confirmation
    console.log('⚠️  WARNING: This will OVERWRITE all data in the database!')
    const confirmed = await askConfirmation('Are you sure you want to continue? (y/N): ')

    if (!confirmed) {
      console.log('❌ Restore cancelled.')
      process.exit(0)
    }

    // Commande pg_restore
    const command = `pg_restore -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c -v "${filepath}"`

    // Définir le mot de passe via variable d'environnement
    const env = { ...process.env, PGPASSWORD: dbConfig.password }

    console.log('\n⏳ Restoring database...')
    await execAsync(command, { env })

    console.log('✅ Database restored successfully!')
    console.log('\n💡 Next steps:')
    console.log('   - Verify data: npm run db:studio')
    console.log('   - Start app: npm run dev')

  } catch (error) {
    console.error('❌ Restore failed:', error)
    console.log('\n💡 If you see errors about objects not existing, this is normal.')
    console.log('   The -c flag tries to drop objects before creating them.')
    process.exit(1)
  }
}

// Lancer le restore
restore()
