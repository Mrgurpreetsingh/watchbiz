'use client'

/**
 * 🏷️ Badge Component - Badges status produits
 *
 * Variants : new (Nouveau), promo (Promotion), stock (En stock), outOfStock (Rupture)
 * Couleurs : ruby-red, gold-champagne, emerald-green
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'new' | 'promo' | 'stock' | 'outOfStock' | 'default'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors',
          {
            // Nouveau (rouge rubis)
            'bg-ruby-red text-white': variant === 'new',
            // Promotion (or champagne)
            'bg-gold-champagne text-luxury-black': variant === 'promo',
            // En stock (vert émeraude)
            'bg-emerald-green text-white': variant === 'stock',
            // Rupture de stock (gris)
            'bg-slate-mid text-white': variant === 'outOfStock',
            // Default (primaire)
            'bg-primary text-primary-foreground': variant === 'default',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
