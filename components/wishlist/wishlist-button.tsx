'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { gsap } from '@/lib/gsap'
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/actions/wishlist'
import { useRouter } from 'next/navigation'

interface WishlistButtonProps {
  productId: string
  variant?: 'default' | 'compact'
  className?: string
}

/**
 * 💝 Wishlist Button - Bouton coeur avec animation GSAP
 *
 * Features:
 * - Animation scale + pulse au clic
 * - State optimistic (mise à jour immédiate UI)
 * - Redirection login si non authentifié
 * - Variants: default (avec texte) | compact (icon seul)
 */
export function WishlistButton({
  productId,
  variant = 'default',
  className = '',
}: WishlistButtonProps) {
  const [isInList, setIsInList] = useState(false)
  const [isPending, startTransition] = useTransition()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const heartRef = useRef<SVGSVGElement>(null)
  const router = useRouter()

  // Vérifier si le produit est dans la wishlist au montage
  useEffect(() => {
    startTransition(async () => {
      const result = await isInWishlist(productId)
      if (result.success && result.data !== undefined) {
        setIsInList(result.data)
      }
    })
  }, [productId])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Animation clic (scale + pulse)
    if (heartRef.current) {
      gsap.to(heartRef.current, {
        scale: 1.3,
        duration: 0.2,
        ease: 'back.out(2)',
        yoyo: true,
        repeat: 1,
      })
    }

    startTransition(async () => {
      const result = isInList
        ? await removeFromWishlist(productId)
        : await addToWishlist(productId)

      if (result.success) {
        setIsInList(!isInList)

        // Animation de réussite (pulse)
        if (buttonRef.current) {
          gsap.fromTo(
            buttonRef.current,
            { scale: 1 },
            {
              scale: 1.1,
              duration: 0.3,
              ease: 'elastic.out(1, 0.5)',
              yoyo: true,
              repeat: 1,
            }
          )
        }
      } else {
        // Si erreur d'auth, rediriger vers login
        if (result.error?.includes('authentifié')) {
          router.push(`/login?callbackUrl=/products/${productId}`)
        }
      }
    })
  }

  if (variant === 'compact') {
    return (
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={isPending}
        className={`group relative p-2 rounded-full transition-all hover:bg-slate-light ${className}`}
        aria-label={isInList ? 'Retirer de la wishlist' : 'Ajouter à la wishlist'}
      >
        <Heart
          ref={heartRef}
          className={`h-5 w-5 transition-colors ${
            isInList
              ? 'fill-ruby-red text-ruby-red'
              : 'text-slate-mid group-hover:text-gold-champagne'
          }`}
        />
      </button>
    )
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      disabled={isPending}
      className={`group flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:border-gold-champagne hover:bg-gold-champagne/5 transition-all ${className}`}
    >
      <Heart
        ref={heartRef}
        className={`h-5 w-5 transition-colors ${
          isInList
            ? 'fill-ruby-red text-ruby-red'
            : 'text-slate-mid group-hover:text-gold-champagne'
        }`}
      />
      <span className="text-sm font-medium text-luxury-black">
        {isPending ? 'Chargement...' : isInList ? 'Dans la wishlist' : 'Ajouter à la wishlist'}
      </span>
    </button>
  )
}
