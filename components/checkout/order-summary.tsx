'use client'

/**
 * 📋 Récapitulatif Commande (Checkout Sidebar)
 *
 * Affiche items, subtotal, shipping, tax, total
 * Sticky sidebar sur desktop
 */

import { useCartStore } from '@/lib/store/cart-store'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import {
  ShippingMethod,
  SHIPPING_OPTIONS,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE
} from '@/types/checkout'

interface OrderSummaryProps {
  shippingMethod?: ShippingMethod | null
}

export function OrderSummary({ shippingMethod }: OrderSummaryProps) {
  const { items, getTotalPrice, getTotalItems } = useCartStore()

  const subtotal = getTotalPrice()
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  // Calcul shipping
  const shippingCost = (() => {
    if (isFreeShipping) return 0
    if (!shippingMethod) return 0

    const selectedOption = SHIPPING_OPTIONS.find(
      (opt) => opt.method === shippingMethod
    )
    return selectedOption?.price || 0
  })()

  const tax = subtotal * TAX_RATE
  const total = subtotal + shippingCost + tax

  return (
    <div className="sticky top-24 bg-white rounded-lg border border-border shadow-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <ShoppingBag className="h-5 w-5 text-gold-champagne" />
        <h3 className="font-heading text-xl font-semibold">
          Récapitulatif ({getTotalItems()} article{getTotalItems() > 1 ? 's' : ''})
        </h3>
      </div>

      {/* Items list (scrollable si > 3 items) */}
      <div className="max-h-64 overflow-y-auto space-y-3 pb-4 border-b border-border">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3">
            <div className="relative flex-shrink-0">
              <Image
                src={item.image || '/images/placeholder-watch.jpg'}
                alt={item.name}
                width={60}
                height={60}
                className="rounded-md object-cover"
              />
              <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gold-champagne flex items-center justify-center text-xs font-bold text-luxury-black">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-luxury-black line-clamp-2">
                {item.name}
              </p>
              <p className="text-sm text-slate-mid mt-1">
                {formatPrice(item.price)} × {item.quantity}
              </p>
            </div>
            <div className="flex-shrink-0 text-sm font-semibold">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Totaux */}
      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-mid">Sous-total</span>
          <span className="font-semibold">{formatPrice(subtotal)}</span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-mid">Livraison</span>
          <span className="font-semibold">
            {shippingMethod ? (
              isFreeShipping ? (
                <span className="text-green-600">Gratuit</span>
              ) : (
                formatPrice(shippingCost)
              )
            ) : (
              <span className="text-slate-mid text-xs">À sélectionner</span>
            )}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-slate-mid">TVA (20%)</span>
          <span className="font-semibold">{formatPrice(tax)}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between text-lg font-semibold pt-2">
          <span>Total</span>
          <span className="font-accent text-2xl text-gold-champagne">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      {/* Info sécurité */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-start gap-2 text-xs text-slate-mid">
          <svg
            className="h-4 w-4 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <p>
            Paiement 100% sécurisé avec Stripe. Vos données bancaires ne sont
            jamais stockées.
          </p>
        </div>
      </div>
    </div>
  )
}
