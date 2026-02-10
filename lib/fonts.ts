/**
 * 🎨 Configuration des Polices - Charte Graphique WatchBiz
 *
 * Typographie luxe horloger (3 polices harmonieuses) :
 * - Playfair Display : Headings (serif élégante)
 * - Inter : Body (sans-serif moderne, déjà utilisée)
 * - Cormorant Garamond : Accent/Prix (serif raffinée)
 */

import { Inter, Playfair_Display, Cormorant_Garamond } from 'next/font/google'

/**
 * Inter - Police principale pour le corps de texte
 * Sans-serif moderne, lisible, déjà utilisée dans le projet
 */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600'],
})

/**
 * Playfair Display - Police pour les titres
 * Serif élégante inspirée des maisons horlogères prestigieuses
 * Usage : H1-H3, noms de produits, titres de sections
 */
export const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '600', '700'],
  display: 'swap',
})

/**
 * Cormorant Garamond - Police accent pour les prix
 * Serif raffinée pour mettre en valeur les prix premium
 * Usage : Prix, badges "Nouveauté", call-to-action
 */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-accent',
  weight: ['500', '600'],
  display: 'swap',
})
