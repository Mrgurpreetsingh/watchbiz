'use client'

import { useCartStore } from '@/lib/store/cart-store'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export function CartSummary() {
  const getTotalPrice = useCartStore(state => state.getTotalPrice)
  const subtotal = getTotalPrice()
  const tax = subtotal * 0.20
  const total = subtotal + tax

  const freeShippingThreshold = 200
  const remainingForFreeShipping = freeShippingThreshold - subtotal

  return (
    <div className="sticky top-24 bg-white rounded-lg border border-border shadow-md p-6 space-y-4">
      <h3 className="font-heading text-xl font-semibold">Récapitulatif</h3>

      <Separator />

      {/* Subtotal */}
      <div className="flex justify-between">
        <span className="text-slate-mid">Sous-total</span>
        <span className="font-semibold">{formatPrice(subtotal)}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between">
        <span className="text-slate-mid">Livraison</span>
        <span className="text-sm text-slate-mid">Calculée au checkout</span>
      </div>

      {/* Free Shipping Progress */}
      {remainingForFreeShipping > 0 && (
        <div className="bg-slate-light/50 rounded-md p-3">
          <p className="text-xs text-slate-premium">
            Ajoutez <span className="font-semibold text-gold-champagne">
              {formatPrice(remainingForFreeShipping)}
            </span> pour la livraison gratuite
          </p>
          <div className="mt-2 h-2 bg-slate-light rounded-full overflow-hidden">
            <div
              className="h-full bg-gold-champagne transition-all"
              style={{ width: `${Math.min((subtotal / freeShippingThreshold) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Tax */}
      <div className="flex justify-between text-sm">
        <span className="text-slate-mid">TVA (20%)</span>
        <span>{formatPrice(tax)}</span>
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between text-lg font-semibold">
        <span>Total</span>
        <span className="font-accent text-2xl text-gold-champagne">{formatPrice(total)}</span>
      </div>

      {/* CTA Checkout */}
      <Button asChild className="w-full" size="lg">
        <Link href="/checkout">Passer commande</Link>
      </Button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-mid pt-2">
        <Lock className="h-3 w-3" />
        <span>Paiement 100% sécurisé</span>
      </div>
    </div>
  )
}
