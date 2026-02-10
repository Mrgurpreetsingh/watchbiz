'use client'

/**
 * 🌓 Theme Toggle - Bouton pour basculer light/dark mode
 *
 * Features:
 * - Animation GSAP au clic (rotation + scale)
 * - Icônes Sun (light) / Moon (dark)
 * - Tooltip au survol
 * - Responsive (compact sur mobile)
 */

import { useEffect, useRef } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/providers/theme-provider'
import gsap from 'gsap'

interface ThemeToggleProps {
  variant?: 'default' | 'compact'
  className?: string
}

export function ThemeToggle({ variant = 'default', className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  const isDark = resolvedTheme === 'dark'
  const isCompact = variant === 'compact'

  // Animation au clic
  const handleClick = () => {
    if (iconRef.current) {
      // Rotation + scale animation
      gsap.to(iconRef.current, {
        rotation: isDark ? 0 : 360,
        scale: 1.2,
        duration: 0.3,
        ease: 'back.out(2)',
        onComplete: () => {
          gsap.to(iconRef.current, {
            scale: 1,
            duration: 0.2,
            ease: 'power2.out',
          })
        },
      })
    }

    toggleTheme()
  }

  // Reset rotation si le thème change (système ou localStorage)
  useEffect(() => {
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        rotation: isDark ? 360 : 0,
        duration: 0,
      })
    }
  }, [isDark])

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`group relative flex items-center justify-center rounded-lg transition-all
        ${isCompact
          ? 'h-10 w-10 bg-white/5 hover:bg-white/10'
          : 'h-12 w-12 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700'
        }
        ${className}
      `}
      aria-label={isDark ? 'Activer le mode clair' : 'Activer le mode sombre'}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
    >
      {/* Icon Container */}
      <div ref={iconRef} className="flex items-center justify-center">
        {isDark ? (
          <Moon
            className={`transition-colors ${
              isCompact
                ? 'h-5 w-5 text-gold-champagne'
                : 'h-6 w-6 text-slate-700 dark:text-slate-300'
            }`}
          />
        ) : (
          <Sun
            className={`transition-colors ${
              isCompact
                ? 'h-5 w-5 text-gold-champagne'
                : 'h-6 w-6 text-slate-700 dark:text-slate-300'
            }`}
          />
        )}
      </div>

      {/* Tooltip (desktop only) */}
      {!isCompact && (
        <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-luxury-black dark:bg-white text-white dark:text-luxury-black text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
          {isDark ? 'Mode clair' : 'Mode sombre'}
        </span>
      )}
    </button>
  )
}
