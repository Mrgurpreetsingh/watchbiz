import { ImageResponse } from 'next/og'

/**
 * 🖼️ OpenGraph Image - Admin Dashboard
 * Génère une image OG 1200x630 pour l'espace admin
 */

export const runtime = 'edge'
export const alt = 'WatchBiz Admin - Dashboard Administration'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a', // slate-900
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        {/* Logo / Titre */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          {/* Icône Shield Admin */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              border: '3px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(212, 175, 55, 0.1)',
            }}
          >
            <svg
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>

          {/* Nom de la marque */}
          <div
            style={{
              fontSize: '90px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.02em',
            }}
          >
            WatchBiz
          </div>
        </div>

        {/* Tagline Admin */}
        <div
          style={{
            fontSize: '42px',
            color: '#f1f5f9', // slate-100
            textAlign: 'center',
            fontWeight: '600',
            marginBottom: '15px',
          }}
        >
          Dashboard Administration
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '26px',
            color: '#94a3b8', // slate-400
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          Gestion des produits, commandes, utilisateurs et analytics
        </div>

        {/* Features badges */}
        <div
          style={{
            display: 'flex',
            gap: '15px',
            marginTop: '50px',
          }}
        >
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            📦 Produits
          </div>
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            📊 Analytics
          </div>
          <div
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              color: '#d4af37',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            👥 Utilisateurs
          </div>
        </div>

        {/* Badge sécurisé */}
        <div
          style={{
            marginTop: '40px',
            padding: '10px 25px',
            borderRadius: '999px',
            background: 'rgba(220, 38, 38, 0.1)',
            border: '2px solid #dc2626',
            color: '#fca5a5',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          🔒 Accès Restreint
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
