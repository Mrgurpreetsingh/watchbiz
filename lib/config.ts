/**
 * ⚙️ Configuration centralisée
 *
 * Équivalent de server/config/ dans une architecture classique
 */

export const config = {
  // App
  app: {
    name: 'WatchBiz',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    description: 'E-commerce de montres de luxe',
  },

  // Database
  database: {
    url: process.env.DATABASE_URL!,
  },

  // Auth
  auth: {
    secret: process.env.NEXTAUTH_SECRET!,
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    sessionMaxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // Stripe
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: 'eur',
  },

  // Email (pour plus tard)
  email: {
    from: 'noreply@watchbiz.com',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },

  // Features flags
  features: {
    enableReviews: true,
    enableWishlist: false, // À implémenter plus tard
    enableNotifications: false, // À implémenter plus tard
  },
} as const

// Valider les variables d'environnement obligatoires au démarrage
if (process.env.NODE_ENV === 'production') {
  const required = ['DATABASE_URL', 'NEXTAUTH_SECRET']
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }
}
