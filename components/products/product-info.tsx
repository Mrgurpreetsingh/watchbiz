'use client'

/**
 * ℹ️ Product Info - Informations détaillées du produit
 *
 * Features:
 * - Breadcrumb (Accueil > Catégorie > Produit)
 * - Nom (h1, Playfair Display Bold)
 * - Marque (lien vers marque)
 * - Prix (Cormorant Garamond, gold-champagne)
 * - Badge stock (En stock/Rupture/Dernières pièces)
 * - Description (prose)
 * - Bouton "Ajouter au panier"
 */

import { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/store/cart-store'

interface ProductInfoProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    compareAtPrice?: number | null
    quantity: number
    images: string[]
    brand: {
      name: string
      slug: string
    }
    category: {
      name: string
      slug: string
    }
  }
}

export function ProductInfo({ product }: ProductInfoProps) {
  const isOutOfStock = product.quantity === 0
  const isLowStock = product.quantity > 0 && product.quantity < 5

  const { addItem } = useCartStore()
  const [isAdding, setIsAdding] = useState(false)

  // Récupérer la première image ou utiliser placeholder
  const firstImage = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : '/images/placeholder-watch.jpg'

  const handleAddToCart = () => {
    setIsAdding(true)

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: firstImage,
      slug: product.slug
    })

    // Feedback visuel
    setTimeout(() => {
      setIsAdding(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-mid" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-luxury-black">
          Accueil
        </Link>
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <Link
          href={`/products?categoryId=${product.category.slug}`}
          className="hover:text-luxury-black"
        >
          {product.category.name}
        </Link>
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-luxury-black">{product.name}</span>
      </nav>

      {/* Marque */}
      <Link
        href={`/brands/${product.brand.slug}`}
        className="inline-block text-sm font-medium uppercase tracking-wider text-slate-mid transition-colors hover:text-gold-champagne"
      >
        {product.brand.name}
      </Link>

      {/* Nom Produit */}
      <h1 className="font-heading text-3xl font-bold leading-tight text-luxury-black md:text-4xl">
        {product.name}
      </h1>

      {/* Prix */}
      <div className="flex items-baseline gap-3">
        <div className="font-accent text-4xl font-semibold text-gold-champagne">
          {formatPrice(product.price)}
        </div>

        {/* Prix barré si promo */}
        {product.compareAtPrice && product.compareAtPrice > 0 && (
          <div className="text-xl text-slate-mid line-through">
            {formatPrice(product.compareAtPrice)}
          </div>
        )}
      </div>

      {/* Badge Stock */}
      <div>
        {isOutOfStock ? (
          <Badge variant="outOfStock">Rupture de stock</Badge>
        ) : isLowStock ? (
          <Badge variant="stock">Dernières pièces - {product.quantity} restantes</Badge>
        ) : (
          <Badge variant="stock">En stock</Badge>
        )}
      </div>

      {/* Description */}
      <div className="prose prose-slate max-w-none border-t border-border pt-6">
        <p className="text-base leading-relaxed text-slate-premium">
          {product.description}
        </p>
      </div>

      {/* Bouton Ajouter au panier */}
      <div className="border-t border-border pt-6">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || isAdding}
          className={`w-full rounded-md px-8 py-4 font-semibold text-ivory transition-all focus:outline-none focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2 ${
            isOutOfStock || isAdding
              ? 'cursor-not-allowed bg-slate-mid opacity-50'
              : 'bg-luxury-black hover:bg-onyx hover:shadow-lg'
          }`}
          aria-label={
            isOutOfStock
              ? 'Produit en rupture de stock'
              : isAdding
              ? 'Ajout en cours'
              : 'Ajouter au panier'
          }
        >
          {isOutOfStock ? 'Rupture de stock' : isAdding ? 'Ajouté au panier ✓' : 'Ajouter au panier'}
        </button>

        {/* Info livraison */}
        {!isOutOfStock && (
          <div className="mt-4 flex items-start gap-3 rounded-md bg-slate-light/50 p-4">
            <svg
              className="h-6 w-6 flex-shrink-0 text-emerald-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div className="text-sm text-slate-premium">
              <p className="font-semibold">Livraison gratuite et sécurisée</p>
              <p className="mt-1">
                Expédition sous 24-48h. Retour gratuit sous 30 jours.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contact */}
      <div className="rounded-md border border-border bg-slate-light/30 p-4 text-sm">
        <p className="font-semibold text-luxury-black">
          Des questions sur ce produit ?
        </p>
        <p className="mt-1 text-slate-mid">
          Notre équipe est à votre disposition pour vous conseiller.
        </p>
        <Link
          href="/contact"
          className="mt-2 inline-flex items-center gap-1 font-medium text-gold-champagne hover:text-gold-dark"
        >
          Nous contacter
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}
