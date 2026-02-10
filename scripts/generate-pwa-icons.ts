import sharp from 'sharp'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * 🎨 Script de Génération d'Icônes PWA
 *
 * Génère automatiquement toutes les icônes PWA requises
 * à partir d'une image source (logo-source.png 1024x1024)
 *
 * Usage: npm run generate-icons
 */

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

const SOURCE_IMAGE = path.join(process.cwd(), 'public', 'logo-source.png')
const ICONS_DIR = path.join(process.cwd(), 'public', 'icons')

async function generateIcons() {
  try {
    console.log('🎨 Génération des icônes PWA...\n')

    // Créer le dossier icons s'il n'existe pas
    try {
      await fs.mkdir(ICONS_DIR, { recursive: true })
      console.log('✓ Dossier icons créé')
    } catch (err) {
      // Dossier existe déjà
    }

    // Vérifier que l'image source existe
    try {
      await fs.access(SOURCE_IMAGE)
    } catch {
      console.error('❌ Erreur: Fichier source non trouvé!')
      console.error(`   Veuillez placer une image PNG 1024x1024 à: ${SOURCE_IMAGE}`)
      process.exit(1)
    }

    // Générer chaque taille d'icône
    for (const size of ICON_SIZES) {
      const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`)

      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 251, b: 245, alpha: 1 }, // ivory
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(outputPath)

      console.log(`✓ Généré: icon-${size}x${size}.png`)
    }

    // Générer aussi les icônes Apple Touch Icon
    const appleTouchIconSizes = [180, 167, 152, 120]
    for (const size of appleTouchIconSizes) {
      const outputPath = path.join(ICONS_DIR, `apple-touch-icon-${size}x${size}.png`)

      await sharp(SOURCE_IMAGE)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 251, b: 245, alpha: 1 },
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(outputPath)

      console.log(`✓ Généré: apple-touch-icon-${size}x${size}.png`)
    }

    // Générer favicon.ico (32x32)
    const faviconPath = path.join(process.cwd(), 'public', 'favicon.ico')
    await sharp(SOURCE_IMAGE)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 251, b: 245, alpha: 1 },
      })
      .png()
      .toFile(faviconPath)

    console.log(`✓ Généré: favicon.ico`)

    console.log('\n✅ Toutes les icônes ont été générées avec succès!')
    console.log(`   Total: ${ICON_SIZES.length + appleTouchIconSizes.length + 1} fichiers`)
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error)
    process.exit(1)
  }
}

generateIcons()
