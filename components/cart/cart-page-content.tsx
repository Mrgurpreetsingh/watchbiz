'use client'

import { useCartStore } from '@/lib/store/cart-store'
import { CartItemRow } from './cart-item-row'
import { CartSummary } from './cart-summary'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'

export function CartPageContent() {
  const { items } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ShoppingCart className="h-24 w-24 text-slate-mid mb-6" />
        <h2 className="font-heading text-2xl font-semibold mb-4">
          Votre panier est vide
        </h2>
        <p className="text-slate-mid mb-8 max-w-md">
          Découvrez notre collection de montres d'exception et trouvez la pièce parfaite.
        </p>
        <Button asChild size="lg">
          <Link href="/products">Explorer les montres</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Items List (2/3) */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg border border-border shadow-sm">
          {/* Table Header (hidden mobile) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-sm font-medium text-slate-mid">
            <div className="col-span-6">Produit</div>
            <div className="col-span-3 text-center">Quantité</div>
            <div className="col-span-3 text-right">Total</div>
          </div>

          {/* Items */}
          <div className="p-6 space-y-6">
            {items.map(item => (
              <CartItemRow key={item.productId} item={item} />
            ))}
          </div>
        </div>

        {/* CTA continuer achats */}
        <div className="mt-6">
          <Button variant="outline" asChild>
            <Link href="/products">← Continuer mes achats</Link>
          </Button>
        </div>
      </div>

      {/* Summary Sidebar (1/3) */}
      <div className="lg:col-span-1">
        <CartSummary />
      </div>
    </div>
  )
}
