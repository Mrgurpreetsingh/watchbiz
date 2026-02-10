'use client'

import { useCartStore } from '@/lib/store/cart-store'
import { Sheet } from '@/components/ui/sheet'
import { CartItemRow } from './cart-item-row'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { ShoppingCart, X } from 'lucide-react'

interface CartSheetProps {
  open: boolean
  onClose: () => void
}

export function CartSheet({ open, onClose }: CartSheetProps) {
  const { items, getTotalPrice, getTotalItems } = useCartStore()
  const subtotal = getTotalPrice()
  const estimatedTax = subtotal * 0.20
  const total = subtotal + estimatedTax

  const isEmpty = items.length === 0

  return (
    <Sheet open={open} onClose={onClose} position="right">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-6">
        <h2 className="font-heading text-2xl font-semibold">
          Panier ({getTotalItems()})
        </h2>
        <button onClick={onClose} className="text-slate-mid hover:text-luxury-black transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center p-12 text-center flex-1">
          <ShoppingCart className="h-16 w-16 text-slate-mid mb-4" />
          <p className="text-slate-premium mb-6">Votre panier est vide</p>
          <Button onClick={onClose} asChild>
            <Link href="/products">Découvrir nos montres</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.map(item => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </div>

          {/* Footer - Totaux */}
          <div className="border-t border-border p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-mid">Sous-total</span>
              <span className="font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-mid">TVA estimée (20%)</span>
              <span>{formatPrice(estimatedTax)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="font-accent text-gold-champagne">{formatPrice(total)}</span>
            </div>

            {/* CTA */}
            <div className="space-y-2 pt-4">
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">Commander</Link>
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Continuer mes achats
              </Button>
            </div>

            {/* Info livraison */}
            <p className="text-xs text-slate-mid text-center pt-2">
              Livraison gratuite dès 200€ d'achat
            </p>
          </div>
        </>
      )}
    </Sheet>
  )
}
