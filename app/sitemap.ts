import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

/**
 * 🗺️ Sitemap Dynamique
 * Génère automatiquement un sitemap.xml avec toutes les URLs du site
 * Pages statiques + produits/catégories/marques dynamiques depuis la DB
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // 1. Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // 2. Pages produits dynamiques
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE', // Seulement les produits actifs
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // 3. Pages catégories dynamiques (si vous avez une page /categories/[slug])
  // Pour l'instant commenté car pas de page catégorie dans votre structure
  /*
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/categories/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
  */

  // 4. Pages marques dynamiques (si vous avez une page /brands/[slug])
  // Pour l'instant commenté car pas de page marque dans votre structure
  /*
  const brands = await prisma.brand.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${baseUrl}/brands/${brand.slug}`,
    lastModified: brand.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
  */

  // Retourner toutes les pages
  return [
    ...staticPages,
    ...productPages,
    // ...categoryPages, // Décommenter si vous ajoutez des pages catégories
    // ...brandPages, // Décommenter si vous ajoutez des pages marques
  ]
}
