'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

/**
 * ⚠️ Error Boundary
 *
 * Catch errors in routes and display fallback UI
 */

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service (Sentry, etc.)
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="font-heading text-3xl font-bold text-luxury-black mb-3">
          Une erreur s'est produite
        </h1>

        {/* Description */}
        <p className="text-slate-mid mb-6">
          Nous sommes désolés, quelque chose s'est mal passé. L'équipe technique a été notifiée.
        </p>

        {/* Error details (only in dev) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-slate-light/50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs font-mono text-red-600 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-slate-mid mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Réessayer
          </Button>
          <Button onClick={() => (window.location.href = '/')} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}
