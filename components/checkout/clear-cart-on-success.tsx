'use client'

/**
 * 🧹 Clear Cart on Success
 *
 * Composant qui vide le panier automatiquement après paiement réussi
 * Utilisé sur la page /checkout/success
 */

import { useEffect } from 'react'
import { useCartStore } from '@/lib/store/cart-store'

export function ClearCartOnSuccess() {
  const clearCart = useCartStore((state) => state.clearCart)

  useEffect(() => {
    // Clear cart when component mounts (success page loaded)
    clearCart()
  }, [clearCart])

  // Ce composant ne rend rien
  return null
}
