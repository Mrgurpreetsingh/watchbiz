'use client'

/**
 * 🏷️ Product Badge - Badge intelligent pour statut produit
 *
 * Détermine automatiquement le badge à afficher selon:
 * - Nouveau: createdAt < 30 jours
 * - Promo: compareAtPrice existe
 * - Rupture: quantity === 0
 * - En stock: quantity > 0
 */

import { Badge } from '@/components/ui/badge'

interface ProductBadgeProps {
  createdAt: Date
  compareAtPrice?: number | null
  quantity: number
  className?: string
}

export function ProductBadge({
  createdAt,
  compareAtPrice,
  quantity,
  className,
}: ProductBadgeProps) {
  // Calculer l'âge du produit en jours
  const ageInDays = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  )

  // Priorité: Rupture > Nouveau > Promo > En stock
  if (quantity === 0) {
    return (
      <Badge variant="outOfStock" className={className}>
        Rupture de stock
      </Badge>
    )
  }

  if (ageInDays <= 30) {
    return (
      <Badge variant="new" className={className}>
        Nouveau
      </Badge>
    )
  }

  if (compareAtPrice && compareAtPrice > 0) {
    return (
      <Badge variant="promo" className={className}>
        Promotion
      </Badge>
    )
  }

  // Badge "En stock" uniquement si quantity faible (< 5 pièces)
  if (quantity > 0 && quantity < 5) {
    return (
      <Badge variant="stock" className={className}>
        Dernières pièces
      </Badge>
    )
  }

  // Pas de badge si stock normal
  return null
}
