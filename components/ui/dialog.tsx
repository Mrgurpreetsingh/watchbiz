'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  className
}: DialogProps) {
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
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      )

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
  }, [open])

  if (!mounted || !open) return null

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={contentRef}
        className={cn(
          'relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'dialog-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2
              id="dialog-title"
              className="font-heading text-xl font-semibold"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-mid hover:text-luxury-black transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
