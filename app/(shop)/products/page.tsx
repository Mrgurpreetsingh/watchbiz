// 🖥️ SERVER COMPONENT (par défaut)
// Accès direct à Prisma, rendu côté serveur avec ISR
// SEO optimisé, pas de JavaScript envoyé pour cette partie
// Régénération automatique toutes les 30 minutes

import prisma from '@/lib/prisma'
import { Metadata } from 'next'
import { ProductGrid } from '@/components/products/product-grid'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { PageTransition } from '@/components/animations/page-transition'

// ISR Configuration - Revalidate toutes les 30 minutes (1800 secondes)
export const revalidate = 1800

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Nos Montres de Luxe - WatchBiz',
  description:
    'Découvrez notre collection exclusive de montres de luxe : Rolex, Omega, TAG Heuer et plus encore.',
  alternates: {
    canonical: `${baseUrl}/products`,
  },
  openGraph: {
    title: 'Nos Montres de Luxe - WatchBiz',
    description: 'Découvrez notre collection exclusive de montres de luxe',
    type: 'website',
    url: `${baseUrl}/products`,
  },
}

// Cette fonction s'exécute UNIQUEMENT côté serveur
async function getProducts() {
  return await prisma.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
      brand: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export default async function ProductsPage() {
  // Fetch direct depuis le serveur - pas de loading, pas de useEffect
  const products = await getProducts()

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory dark:bg-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <ScrollReveal direction="up" delay={0}>
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-heading text-4xl font-bold text-luxury-black dark:text-white md:text-5xl">
              Notre Collection
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-mid dark:text-slate-300">
              Découvrez notre sélection de montres de luxe, alliant savoir-faire
              horloger et design intemporel.
            </p>
          </div>
        </ScrollReveal>

        {/* Filtres & Recherche - À venir en PRIORITÉ 5 */}
        <div className="mb-8">
          {/* Placeholder pour FilterSidebar et SearchBar */}
        </div>

        {/* Product Grid */}
        <ScrollReveal direction="up" delay={0.2}>
          <ProductGrid products={products} columns={4} />
        </ScrollReveal>

        {/* CTA Bottom */}
        {products.length > 0 && (
          <ScrollReveal direction="up" delay={0.4}>
            <div className="mt-16 rounded-lg bg-slate-light/50 dark:bg-slate-800 p-8 text-center">
              <h2 className="mb-3 font-heading text-2xl font-semibold text-luxury-black dark:text-white">
                Vous ne trouvez pas ce que vous cherchez ?
              </h2>
              <p className="mb-6 text-slate-mid dark:text-slate-300">
                Contactez-nous pour obtenir des recommandations personnalisées.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-luxury-black dark:bg-slate-700 px-6 py-3 font-semibold text-ivory dark:text-white transition-colors hover:bg-onyx dark:hover:bg-slate-600"
              >
                Nous contacter
              </a>
            </div>
          </ScrollReveal>
        )}
      </div>
    </PageTransition>
  )
}
