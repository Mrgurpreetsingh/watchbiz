import { MetadataRoute } from 'next'

/**
 * 🤖 Robots.txt Dynamique
 * Configure les directives pour les robots de crawling (Google, Bing, etc.)
 * - Autorise l'accès aux pages publiques
 * - Bloque l'accès aux pages admin et API
 * - Référence le sitemap
 */

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/', // Homepage
          '/products', // Boutique
          '/products/*', // Pages produits individuelles
          '/login', // Login (indexable pour SEO)
          '/register', // Register (indexable pour SEO)
        ],
        disallow: [
          '/admin', // Bloquer tout l'espace admin
          '/admin/*',
          '/api/*', // Bloquer les API routes
          '/checkout', // Pas besoin d'indexer le checkout
          '/checkout/*',
          '/cart', // Pas besoin d'indexer le panier
          '/account', // Pas besoin d'indexer les comptes utilisateurs
          '/account/*',
          '/_next/*', // Bloquer les assets Next.js
          '/static/*', // Bloquer les fichiers statiques
        ],
        crawlDelay: 1, // 1 seconde entre chaque requête (optionnel, pour limiter la charge)
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/products',
          '/products/*',
          '/login',
          '/register',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/account',
          '/account/*',
        ],
        crawlDelay: 0, // Pas de délai pour Googlebot (il gère bien la charge)
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/products',
          '/products/*',
          '/login',
          '/register',
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/*',
          '/checkout',
          '/checkout/*',
          '/cart',
          '/account',
          '/account/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
