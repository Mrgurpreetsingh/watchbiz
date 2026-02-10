'use client'

/**
 * 📦 Product Grid - Grille responsive de produits
 *
 * Features:
 * - Responsive : 1/2/3/4 colonnes selon breakpoints
 * - Loading states avec Skeleton
 * - Empty state si aucun produit
 * - Support columns prop (3 ou 4)
 */

import { ProductCard } from './product-card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice?: number | null
    images: string[]
    brand: {
      name: string
    }
    isFeatured: boolean
    quantity: number
    createdAt: Date
  }>
  loading?: boolean
  columns?: 3 | 4
  className?: string
}

export function ProductGrid({
  products,
  loading = false,
  columns = 3,
  className,
}: ProductGridProps) {
  // Loading state : 8 skeleton cards
  if (loading) {
    return (
      <div
        className={cn(
          'grid gap-6',
          {
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3,
            'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4':
              columns === 4,
          },
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton variant="rectangle" className="aspect-square w-full" />
            <Skeleton variant="text" className="h-4 w-2/3" />
            <Skeleton variant="text" className="h-6 w-full" />
            <Skeleton variant="text" className="h-8 w-1/3" />
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-mid bg-slate-light/30 p-12 text-center">
        <svg
          className="mb-4 h-16 w-16 text-slate-mid"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <h3 className="mb-2 font-heading text-xl font-semibold text-luxury-black">
          Aucun produit trouvé
        </h3>
        <p className="text-sm text-slate-mid">
          Essayez de modifier vos filtres ou votre recherche
        </p>
      </div>
    )
  }

  // Grille produits
  return (
    <div
      className={cn(
        'grid gap-6',
        {
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4':
            columns === 4,
        },
        className
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4} // Priority pour les 4 premiers (above the fold)
        />
      ))}
    </div>
  )
}
