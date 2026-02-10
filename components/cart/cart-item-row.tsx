'use client'

import Image from 'next/image'
import Link from 'next/link'
import { CartItem } from '@/types'
import { useCartStore } from '@/lib/store/cart-store'
import { formatPrice } from '@/lib/utils'
import { QuantitySelector } from './quantity-selector'
import { Trash2 } from 'lucide-react'

interface CartItemRowProps {
  item: CartItem
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore()
  const totalPrice = item.price * item.quantity

  return (
    <div className="flex gap-4 pb-4 border-b border-border last:border-0">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="flex-shrink-0">
        <Image
          src={item.image || '/images/placeholder-watch.jpg'}
          alt={item.name}
          width={80}
          height={80}
          className="rounded-md object-cover"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="font-medium text-luxury-black hover:text-gold-champagne line-clamp-2 transition-colors"
        >
          {item.name}
        </Link>

        <div className="mt-2 flex items-center gap-4">
          <QuantitySelector
            quantity={item.quantity}
            onIncrease={() => updateQuantity(item.productId, item.quantity + 1)}
            onDecrease={() => updateQuantity(item.productId, item.quantity - 1)}
          />

          <button
            onClick={() => removeItem(item.productId)}
            className="text-slate-mid hover:text-ruby-red transition-colors"
            aria-label="Supprimer l'article"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Prix */}
      <div className="text-right flex-shrink-0">
        <div className="font-accent font-semibold text-luxury-black">
          {formatPrice(totalPrice)}
        </div>
        {item.quantity > 1 && (
          <div className="text-xs text-slate-mid mt-1">
            {formatPrice(item.price)} / unité
          </div>
        )}
      </div>
    </div>
  )
}
