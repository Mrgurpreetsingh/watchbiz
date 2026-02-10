import sharp from 'sharp'
import path from 'path'

/**
 * Créer un logo temporaire simple pour la PWA
 * Vous pouvez remplacer public/logo-source.png par votre propre logo plus tard
 */

async function createTempLogo() {
  const size = 1024
  const outputPath = path.join(process.cwd(), 'public', 'logo-source.png')

  // Créer un SVG simple avec le texte "WatchBiz"
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <!-- Fond ivory -->
      <rect width="${size}" height="${size}" fill="#fffbf5"/>

      <!-- Cercle gold -->
      <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="#d4af37" opacity="0.2"/>

      <!-- Texte WatchBiz -->
      <text
        x="50%"
        y="50%"
        font-family="serif"
        font-size="140"
        font-weight="bold"
        fill="#1a1a1a"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        WatchBiz
      </text>

      <!-- Icône montre simple -->
      <circle cx="${size/2}" cy="${size/2 - 180}" r="80" fill="none" stroke="#d4af37" stroke-width="12"/>
      <line x1="${size/2}" y1="${size/2 - 180}" x2="${size/2}" y2="${size/2 - 220}" stroke="#d4af37" stroke-width="8" stroke-linecap="round"/>
      <line x1="${size/2}" y1="${size/2 - 180}" x2="${size/2 + 40}" y2="${size/2 - 200}" stroke="#d4af37" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `

  await sharp(Buffer.from(svg))
    .png({ quality: 100 })
    .toFile(outputPath)

  console.log('✅ Logo temporaire créé:', outputPath)
  console.log('   Vous pouvez le remplacer par votre propre logo (1024x1024 PNG)')
}

createTempLogo()
