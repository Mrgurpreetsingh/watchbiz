'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

/**
 * 🍞 Toast Component
 *
 * Composant de notification toast avec variantes (success, error, info, warning)
 */

export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  onClose: (id: string) => void
}

const variantStyles = {
  default: {
    container: 'bg-white border-slate-200',
    icon: null,
    iconColor: ''
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-600'
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: AlertCircle,
    iconColor: 'text-red-600'
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600'
  },
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600'
  }
}

export function Toast({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  onClose
}: ToastProps) {
  const [isExiting, setIsExiting] = React.useState(false)
  const style = variantStyles[variant]
  const Icon = style.icon

  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'pointer-events-auto w-full max-w-md overflow-hidden rounded-lg border shadow-lg',
        'transition-all duration-300',
        isExiting
          ? 'animate-out fade-out-0 slide-out-to-right-full'
          : 'animate-in fade-in-0 slide-in-from-right-full',
        style.container
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', style.iconColor)} />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-semibold text-luxury-black">{title}</p>
          )}
          {description && (
            <p className="mt-1 text-sm text-slate-mid">{description}</p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className={cn(
            'flex-shrink-0 inline-flex rounded-md p-1',
            'text-slate-mid hover:text-luxury-black',
            'transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-gold-champagne'
          )}
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
