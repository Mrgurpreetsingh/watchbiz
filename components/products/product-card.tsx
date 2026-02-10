'use client'

/**
 * 🃏 Product Card - Carte produit avec animations GSAP
 *
 * Features:
 * - Badge auto (Nouveau/Promo/Rupture)
 * - Animations GSAP hover (image scale, prix color change)
 * - Next/Image optimisé avec priority si featured
 * - Prix formaté avec formatPrice()
 * - Link vers /products/[slug]
 */

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import { formatPrice } from '@/lib/utils'
import { ProductBadge } from './product-badge'
import { WishlistButton } from '@/components/wishlist/wishlist-button'

interface ProductCardProps {
  product: {
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
  }
  priority?: boolean
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const imageRef = useRef<HTMLDivElement>(null)
  const priceRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleMouseEnter = () => {
      // Scale image 1.05
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          scale: 1.05,
          duration: 0.4,
          ease: 'power2.out',
        })
      }

      // Change prix color à gold-champagne
      if (priceRef.current) {
        gsap.to(priceRef.current, {
          color: '#D4AF37', // gold-champagne
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    const handleMouseLeave = () => {
      // Reset image
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
        })
      }

      // Reset prix color
      if (priceRef.current) {
        gsap.to(priceRef.current, {
          color: '#0f0f0f', // luxury-black
          duration: 0.3,
          ease: 'power2.out',
        })
      }
    }

    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <Link
      ref={cardRef}
      href={`/products/${product.slug}`}
      className="group relative block overflow-hidden rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-shadow hover:shadow-lg dark:hover:shadow-2xl"
      aria-label={`Voir les détails de ${product.name}`}
    >
      {/* Badge Status */}
      {product.quantity !== undefined && (
        <div className="absolute left-3 top-3 z-10">
          <ProductBadge
            createdAt={product.createdAt}
            compareAtPrice={product.compareAtPrice}
            quantity={product.quantity}
          />
        </div>
      )}

      {/* Wishlist Button */}
      <div className="absolute right-3 top-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <WishlistButton productId={product.id} variant="compact" />
      </div>

      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-slate-light dark:bg-slate-700">
        <div ref={imageRef} className="h-full w-full">
          <Image
            src={product.images[0] || '/images/placeholder-watch.jpg'}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-mid dark:text-slate-400">
          {product.brand.name}
        </p>

        {/* Nom Produit */}
        <h3 className="mb-2 line-clamp-2 font-heading text-lg font-semibold leading-tight text-luxury-black dark:text-white">
          {product.name}
        </h3>

        {/* Prix */}
        <div className="flex items-baseline gap-2">
          <div
            ref={priceRef}
            className="font-accent text-2xl font-semibold text-luxury-black dark:text-white transition-colors"
          >
            {formatPrice(product.price)}
          </div>

          {/* Prix barré si promo */}
          {product.compareAtPrice && product.compareAtPrice > 0 && (
            <div className="text-sm text-slate-mid dark:text-slate-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </div>
          )}
        </div>

        {/* Hover CTA */}
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-onyx dark:text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">
          Voir les détails
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  )
}
