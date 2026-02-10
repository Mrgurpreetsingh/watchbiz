'use client'

import { useEffect } from 'react'
import { useRecentlyViewed, type RecentProduct } from '@/hooks/use-recently-viewed'

/**
 * 👁️ Product View Tracker - Track product views dans localStorage
 *
 * Composant client invisible qui ajoute le produit aux récemment consultés
 * Doit être monté dans la page produit (Server Component)
 */

interface ProductViewTrackerProps {
  product: RecentProduct
}

export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  const { addProduct } = useRecentlyViewed()

  useEffect(() => {
    // Ajouter le produit aux récemment consultés
    addProduct(product)
  }, [product, addProduct])

  // Composant invisible
  return null
}
