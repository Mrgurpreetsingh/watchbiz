'use client'

/**
 * 💫 Loader Premium - Animation Or Champagne
 *
 * Loader fullscreen avec ring animé GSAP
 * Affichage pendant chargement initial ou transitions de pages
 */

import { useEffect, useRef } from 'react'
import { gsap } from '@/lib/gsap'

interface LuxuryLoaderProps {
  isLoading?: boolean
}

export function LuxuryLoader({ isLoading = true }: LuxuryLoaderProps) {
  const loaderRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ringRef.current) return

    // Animation rotation infinie
    const tl = gsap.timeline({ repeat: -1 })
    tl.to(ringRef.current, {
      rotation: 360,
      duration: 2,
      ease: 'power1.inOut',
    })

    return () => {
      tl.kill()
    }
  }, [])

  useEffect(() => {
    if (!loaderRef.current) return

    if (isLoading) {
      // Fade in
      gsap.to(loaderRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      })
    } else {
      // Fade out
      gsap.to(loaderRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          if (loaderRef.current) {
            loaderRef.current.style.display = 'none'
          }
        },
      })
    }
  }, [isLoading])

  if (!isLoading) return null

  return (
    <div
      ref={loaderRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ivory/90 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4">
        {/* Ring animé */}
        <div className="relative h-20 w-20">
          <div
            ref={ringRef}
            className="absolute inset-0 rounded-full border-4 border-gold-champagne/30 border-t-gold-champagne"
          />
        </div>

        {/* Texte chargement */}
        <p className="font-heading text-lg text-slate-premium">
          Chargement<span className="animate-pulse">...</span>
        </p>
      </div>
    </div>
  )
}
