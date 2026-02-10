'use client'

import { useEffect, useState } from 'react'

/**
 * 👀 Hook useRecentlyViewed - Gestion des produits récemment consultés
 *
 * Features:
 * - Stockage dans localStorage
 * - Max 8 produits récents
 * - Dédoublonnage automatique
 * - Ordre chronologique (plus récent en premier)
 */

export interface RecentProduct {
  id: string
  slug: string
  name: string
  price: number
  image: string
  brandName: string
}

const STORAGE_KEY = 'watchbiz_recently_viewed'
const MAX_ITEMS = 8

export function useRecentlyViewed() {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([])

  // Charger les produits récents depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setRecentProducts(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error('Error parsing recently viewed:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Ajouter un produit aux récemment consultés
  const addProduct = (product: RecentProduct) => {
    setRecentProducts((prev) => {
      // Retirer le produit s'il existe déjà (pour éviter les doublons)
      const filtered = prev.filter((p) => p.id !== product.id)

      // Ajouter le produit au début du tableau
      const updated = [product, ...filtered]

      // Limiter à MAX_ITEMS
      const limited = updated.slice(0, MAX_ITEMS)

      // Sauvegarder dans localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(limited))

      return limited
    })
  }

  // Retirer un produit
  const removeProduct = (productId: string) => {
    setRecentProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== productId)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
      return filtered
    })
  }

  // Vider tous les produits récents
  const clearAll = () => {
    setRecentProducts([])
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    recentProducts,
    addProduct,
    removeProduct,
    clearAll,
  }
}
