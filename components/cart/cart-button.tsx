'use client'

import { useState, useEffect, useRef } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'
import { CartSheet } from './cart-sheet'
import { gsap } from '@/lib/gsap'

export function CartButton() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const totalItems = useCartStore(state => state.getTotalItems())
  const badgeRef = useRef<HTMLSpanElement>(null)
  const prevTotalRef = useRef(totalItems)

  // Animation badge quand quantité change
  useEffect(() => {
    if (totalItems > prevTotalRef.current && badgeRef.current) {
      // Vérifier que l'élément est monté et visible
      const element = badgeRef.current;
      if (element && element.offsetParent !== null) {
        gsap.fromTo(
          element,
          { scale: 1 },
          {
            scale: 1.3,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
          }
        );
      }
    }
    prevTotalRef.current = totalItems;
  }, [totalItems])

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className="relative p-2 text-slate-700 hover:text-luxury-black transition-colors"
        aria-label={`Panier - ${totalItems} article${totalItems > 1 ? 's' : ''}`}
      >
        <ShoppingCart className="h-5 w-5" />

        {totalItems > 0 && (
          <span
            ref={badgeRef}
            className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-ruby-red rounded-full min-w-[20px]"
          >
            {totalItems}
          </span>
        )}
      </button>

      <CartSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  )
}
