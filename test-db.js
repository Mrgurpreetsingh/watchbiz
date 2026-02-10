/**
 * Script de diagnostic de connexion DB
 *
 * Usage: node test-db.js
 */

console.log('===========================================')
console.log('Diagnostic de connexion a la base de donnees')
console.log('===========================================\n')

// 1. Verifier les variables d'environnement
console.log('1. Variables d\'environnement:')
console.log('   DATABASE_URL:', process.env.DATABASE_URL || 'NON DEFINIE')
console.log()

// 2. Charger le .env manuellement
require('dotenv').config()

console.log('2. Apres chargement du .env:')
console.log('   DATABASE_URL:', process.env.DATABASE_URL || 'NON DEFINIE')
console.log()

// 3. Tester la connexion Prisma
console.log('3. Test de connexion Prisma...')

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function testConnection() {
  try {
    console.log('   Tentative de connexion...')

    await prisma.$connect()
    console.log('   [OK] Connexion reussie !\n')

    // Compter les utilisateurs
    const userCount = await prisma.user.count()
    console.log('   Nombre d\'utilisateurs dans la DB:', userCount)

    // Lister les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })

    if (users.length > 0) {
      console.log('\n   Utilisateurs existants:')
      users.forEach((user) => {
        console.log('      -', user.email, '(' + user.name + ') [' + user.role + ']')
      })
    }

    console.log('\n[SUCCESS] La connexion a la base de donnees fonctionne !')
    console.log('\nProchaines etapes:')
    console.log('1. Arretez le serveur Next.js (Ctrl+C)')
    console.log('2. Nettoyez le cache: rm -rf .next')
    console.log('3. Redemarrez: npm run dev')

  } catch (error) {
    console.log('   [ERREUR] Echec de connexion:')
    console.log('   ', error.message)
    console.log()
    console.log('Solutions possibles:')
    console.log('   1. Verifier que PostgreSQL est demarre')
    console.log('   2. Verifier les credentials dans le .env')
    console.log('   3. Tester manuellement: psql -U postgres -d watchbiz')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
