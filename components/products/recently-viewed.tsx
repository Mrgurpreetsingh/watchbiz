'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock } from 'lucide-react'
import { useRecentlyViewed } from '@/hooks/use-recently-viewed'
import { formatPrice } from '@/lib/utils'
import { WishlistButton } from '@/components/wishlist/wishlist-button'

/**
 * 👀 Recently Viewed - Section produits récemment consultés
 *
 * Features:
 * - Affichage des 4-8 derniers produits consultés
 * - Carousel horizontal scrollable
 * - Wishlist button intégré
 * - Empty state si aucun produit
 */

interface RecentlyViewedProps {
  currentProductId?: string // Pour exclure le produit actuel
  maxItems?: number
  className?: string
}

export function RecentlyViewed({
  currentProductId,
  maxItems = 4,
  className = '',
}: RecentlyViewedProps) {
  const { recentProducts } = useRecentlyViewed()
  const [mounted, setMounted] = useState(false)

  // Attendre le montage côté client (pour éviter les hydration errors)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // ou skeleton loader
  }

  // Filtrer le produit actuel si on est sur une page produit
  const filteredProducts = currentProductId
    ? recentProducts.filter((p) => p.id !== currentProductId)
    : recentProducts

  const displayedProducts = filteredProducts.slice(0, maxItems)

  if (displayedProducts.length === 0) {
    return null // Ne rien afficher si aucun produit récent
  }

  return (
    <section className={`py-12 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-gold-champagne" />
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-luxury-black">
            Récemment consultés
          </h2>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Wishlist Button */}
              <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <WishlistButton productId={product.id} variant="compact" />
              </div>

              {/* Product Link */}
              <Link href={`/products/${product.slug}`} className="block">
                {/* Image */}
                <div className="relative aspect-square bg-slate-light overflow-hidden">
                  <Image
                    src={product.image || '/images/placeholder-watch.jpg'}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-3">
                  {/* Brand */}
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-mid mb-1">
                    {product.brandName}
                  </p>

                  {/* Name */}
                  <h3 className="font-heading text-sm font-semibold leading-tight text-luxury-black mb-2 line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="font-accent text-lg font-semibold text-luxury-black">
                    {formatPrice(product.price)}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
