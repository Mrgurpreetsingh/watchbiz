'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'

interface SheetProps {
  open: boolean
  onClose: () => void
  position?: 'right' | 'bottom'
  children: React.ReactNode
  className?: string
}

export function Sheet({
  open,
  onClose,
  position = 'right',
  children,
  className
}: SheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [open, onClose])

  // Animations
  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return

    if (open) {
      // Fade-in overlay
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      )

      // Slide-in content
      const slideFrom = position === 'right' ? { x: '100%' } : { y: '100%' }
      gsap.fromTo(
        contentRef.current,
        slideFrom,
        { x: 0, y: 0, duration: 0.4, ease: 'power3.out' }
      )
    }
  }, [open, position])

  if (!mounted || !open) return null

  const content = (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        ref={contentRef}
        className={cn(
          'absolute bg-white shadow-xl flex flex-col',
          position === 'right' &&
            'top-0 right-0 h-full w-full sm:w-96 md:w-[500px]',
          position === 'bottom' &&
            'bottom-0 left-0 right-0 max-h-[90vh] rounded-t-2xl',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
