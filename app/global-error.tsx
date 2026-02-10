'use client'

import { useEffect } from 'react'

/**
 * 🌍 Global Error Boundary
 *
 * Catch errors in root layout (rare cases)
 * This file must be a Client Component
 */

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ maxWidth: '32rem', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Une erreur critique s'est produite
            </h1>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>
              Nous sommes désolés, quelque chose s'est mal passé. Veuillez rafraîchir la page.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={reset}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Réessayer
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#f1f5f9',
                  color: '#000',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Retour à l'accueil
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', textAlign: 'left' }}>
                <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#dc2626', wordBreak: 'break-all' }}>
                  {error.message}
                </p>
                {error.digest && (
                  <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', marginTop: '0.5rem' }}>
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  )
}
