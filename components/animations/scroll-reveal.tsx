'use client'

/**
 * 📜 Scroll Reveal - Révélation au scroll
 *
 * Anime les éléments quand ils entrent dans le viewport
 * Utilise GSAP ScrollTrigger pour détection automatique
 */

import { useEffect, useRef, ReactNode } from 'react'
import { gsap, ScrollTrigger } from '@/lib/gsap'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  distance = 50,
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!elementRef.current) return

    // Calculer la position initiale selon la direction
    const getInitialPosition = () => {
      switch (direction) {
        case 'up':
          return { x: 0, y: distance }
        case 'down':
          return { x: 0, y: -distance }
        case 'left':
          return { x: distance, y: 0 }
        case 'right':
          return { x: -distance, y: 0 }
        default:
          return { x: 0, y: distance }
      }
    }

    const initialPos = getInitialPosition()

    // Animation avec ScrollTrigger
    gsap.fromTo(
      elementRef.current,
      {
        opacity: 0,
        x: initialPos.x,
        y: initialPos.y,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 0.8,
        delay,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: elementRef.current,
          start: 'top 80%', // Animation démarre quand l'élément est à 80% du viewport
          toggleActions: 'play none none reverse', // play on enter, reverse on leave
        },
      }
    )

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === elementRef.current) {
          trigger.kill()
        }
      })
    }
  }, [delay, direction, distance])

  return <div ref={elementRef}>{children}</div>
}
