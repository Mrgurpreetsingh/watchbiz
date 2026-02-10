'use client'

/**
 * 🎬 Page Transition - Animations de pages
 *
 * Fade in + translateY pour transitions fluides entre pages
 */

import { useEffect, useRef, ReactNode } from 'react'
import { gsap } from '@/lib/gsap'

interface PageTransitionProps {
  children: ReactNode
  delay?: number
}

export function PageTransition({ children, delay = 0 }: PageTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Animation fade in + slide up
    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        delay,
        ease: 'power2.out',
      }
    )
  }, [delay])

  return <div ref={containerRef}>{children}</div>
}
