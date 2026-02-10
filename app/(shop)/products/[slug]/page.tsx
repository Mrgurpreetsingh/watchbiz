/**
 * 🎯 Product Detail Page - Page détail produit
 *
 * Server Component avec ISR (Incremental Static Regeneration)
 * - Génération statique au build pour les produits actifs
 * - Régénération automatique toutes les heures
 * - Génération à la demande pour les nouveaux produits
 * Utilise : ProductGallery, ProductInfo, ProductSpecs
 * Metadata dynamique pour SEO
 */

import dynamic from 'next/dynamic'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ProductGallery } from '@/components/products/product-gallery'
import { ProductInfo } from '@/components/products/product-info'
import { ProductSpecs } from '@/components/products/product-specs'
import { PageTransition } from '@/components/animations/page-transition'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductViewTracker } from '@/components/products/product-view-tracker'
import { RecentlyViewed } from '@/components/products/recently-viewed'
import { ProductGrid } from '@/components/products/product-grid'

// Lazy load reviews section (en bas de page, non critique)
const ProductReviewsSection = dynamic(
  () => import('@/components/products/product-reviews-section').then(mod => ({ default: mod.ProductReviewsSection })),
  {
    loading: () => (
      <div className="mt-16 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    ),
  }
)

// ISR Configuration - Revalidate toutes les heures (3600 secondes)
export const revalidate = 3600

interface ProductDetailPageProps {
  params: Promise<{
    slug: string
  }>
}

// Génération statique des pages produits au build
export async function generateStaticParams() {
  // Fetch tous les produits actifs pour pré-générer les pages
  const products = await prisma.product.findMany({
    where: {
      isActive: true, // Seulement les produits actifs
    },
    select: {
      slug: true,
    },
    take: 100, // Limiter à 100 produits pour éviter un build trop long
    orderBy: {
      createdAt: 'desc', // Les produits les plus récents en premier
    },
  })

  return products.map((product) => ({
    slug: product.slug,
  }))
}

// Generate Metadata pour SEO
export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, category: true },
  })

  if (!product) {
    return {
      title: 'Produit non trouvé - WatchBiz',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const productUrl = `${baseUrl}/products/${product.slug}`

  return {
    title: `${product.name} - ${product.brand.name} | WatchBiz`,
    description: product.description.substring(0, 160),
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
      type: 'website',
      url: productUrl,
    },
  }
}

// Fetch product data
async function getProduct(slug: string) {
  return await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      reviews: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
    },
  })
}

// Fetch similar products (même catégorie, exclure produit actuel)
async function getSimilarProducts(productId: string, categoryId: string, limit = 4) {
  return await prisma.product.findMany({
    where: {
      categoryId,
      id: { not: productId }, // Exclure le produit actuel
      status: 'ACTIVE',
      stock: { gt: 0 }, // Seulement produits en stock
    },
    include: {
      brand: true,
      category: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    take: limit,
    orderBy: {
      createdAt: 'desc', // Produits les plus récents
    },
  })
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params
  const product = await getProduct(slug)

  // 404 si produit non trouvé
  if (!product) {
    notFound()
  }

  // Récupérer les produits similaires
  const similarProducts = await getSimilarProducts(product.id, product.categoryId, 4)

  // Parse specifications (JSON to object)
  const specifications = product.specifications as Record<string, string> | null

  // Calculer le rating moyen si reviews existent
  const averageRating =
    product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length
      : 0

  // JSON-LD Structured Data pour SEO (Product + Breadcrumb)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      // Product Schema
      {
        '@type': 'Product',
        '@id': `${baseUrl}/products/${product.slug}#product`,
        name: product.name,
        description: product.description,
        image: product.images[0] || '',
        brand: {
          '@type': 'Brand',
          name: product.brand.name,
        },
        offers: {
          '@type': 'Offer',
          url: `${baseUrl}/products/${product.slug}`,
          priceCurrency: 'EUR',
          price: product.price,
          availability:
            product.quantity > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          priceValidUntil: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(), // 30 jours
        },
        ...(product.reviews.length > 0 && {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: averageRating.toFixed(1),
            reviewCount: product.reviews.length,
            bestRating: 5,
            worstRating: 1,
          },
        }),
        category: product.category.name,
        sku: product.id,
      },
      // BreadcrumbList Schema
      {
        '@type': 'BreadcrumbList',
        '@id': `${baseUrl}/products/${product.slug}#breadcrumb`,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Accueil',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Produits',
            item: `${baseUrl}/products`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: product.category.name,
            item: `${baseUrl}/products?category=${product.category.slug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: product.name,
            item: `${baseUrl}/products/${product.slug}`,
          },
        ],
      },
    ],
  }

  return (
    <PageTransition>
      {/* Track product view (invisible) */}
      <ProductViewTracker
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images[0] || '/images/placeholder-watch.jpg',
          brandName: product.brand.name,
        }}
      />

      <div className="min-h-screen bg-ivory">
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <div className="container mx-auto px-4 py-12">
          {/* Grille 2 colonnes : Galerie + Info */}
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Galerie Images */}
            <ScrollReveal direction="left" delay={0}>
              <ProductGallery images={product.images} alt={product.name} />
            </ScrollReveal>

            {/* Informations Produit */}
            <ScrollReveal direction="right" delay={0.2}>
              <ProductInfo product={product} />
            </ScrollReveal>
          </div>

          {/* Spécifications Techniques */}
          <ScrollReveal direction="up" delay={0.4}>
            <ProductSpecs specifications={specifications} />
          </ScrollReveal>

          {/* Reviews & Ratings */}
          <ScrollReveal direction="up" delay={0.6}>
            <div className="mt-16">
              <ProductReviewsSection productId={product.id} />
            </div>
          </ScrollReveal>
        </div>

        {/* Recently Viewed Products */}
        <ScrollReveal direction="up" delay={0.8}>
          <RecentlyViewed currentProductId={product.id} maxItems={4} />
        </ScrollReveal>

        {/* Produits Similaires */}
        {similarProducts.length > 0 && (
          <div className="container mx-auto px-4 mt-16">
            <ScrollReveal direction="up" delay={1}>
              <div className="mb-16">
                <h2 className="mb-8 font-heading text-3xl font-semibold text-luxury-black dark:text-white">
                  Vous aimerez aussi
                </h2>
                <ProductGrid products={similarProducts} />
              </div>
            </ScrollReveal>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
