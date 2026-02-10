/**
 * 🔐 Script pour créer un utilisateur admin
 *
 * Usage: node create-admin.js
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('🔐 Création d\'un utilisateur admin...\n')

    // Vérifier la connexion
    await prisma.$connect()
    console.log('✅ Connexion à la base de données OK\n')

    // Hash du mot de passe (changez 'admin123' par un mot de passe fort)
    const password = process.argv[2] || 'admin123'
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'admin (ou mettre à jour s'il existe déjà)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@watchbiz.com' },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
      },
      create: {
        email: 'admin@watchbiz.com',
        name: 'Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    })

    console.log('✅ Utilisateur admin créé avec succès!')
    console.log('\n📧 Email:', admin.email)
    console.log('🔑 Mot de passe:', password)
    console.log('👤 Rôle:', admin.role)
    console.log('\n🎉 Vous pouvez maintenant vous connecter sur http://localhost:3000/login')

    if (password === 'admin123') {
      console.log('\n⚠️  ATTENTION: Mot de passe faible détecté!')
      console.log('Pour un mot de passe fort: node create-admin.js VotreMotDePasseFort123!')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
