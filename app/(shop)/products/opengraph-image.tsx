import { ImageResponse } from 'next/og'

/**
 * 🖼️ OpenGraph Image - Shop Products Page
 * Génère une image OG 1200x630 pour la page boutique
 */

export const runtime = 'edge'
export const alt = 'Boutique de Montres de Luxe - WatchBiz'
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
        {/* Titre principal */}
        <div
          style={{
            fontSize: '72px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '30px',
            letterSpacing: '-0.02em',
          }}
        >
          Collection Exclusive
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '32px',
            color: '#f1f5f9', // slate-100
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            marginBottom: '20px',
          }}
        >
          Découvrez notre sélection de montres de luxe
        </div>

        {/* Marques */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8', // slate-400
            textAlign: 'center',
            marginBottom: '50px',
          }}
        >
          Rolex • Omega • TAG Heuer • Breitling • Cartier
        </div>

        {/* Features Grid */}
        <div
          style={{
            display: 'flex',
            gap: '25px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '25px 35px',
              borderRadius: '12px',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              background: 'rgba(212, 175, 55, 0.05)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>✨</div>
            <div style={{ fontSize: '20px', color: '#d4af37', fontWeight: '600' }}>
              Authentiques
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '25px 35px',
              borderRadius: '12px',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              background: 'rgba(212, 175, 55, 0.05)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🚚</div>
            <div style={{ fontSize: '20px', color: '#d4af37', fontWeight: '600' }}>
              Livraison Offerte
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '25px 35px',
              borderRadius: '12px',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              background: 'rgba(212, 175, 55, 0.05)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
            <div style={{ fontSize: '20px', color: '#d4af37', fontWeight: '600' }}>
              Paiement Sécurisé
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginTop: '50px',
          }}
        >
          {/* Watch Icon */}
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: '2px solid #d4af37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d4af37"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="7" />
              <polyline points="12 9 12 12 13.5 13.5" />
            </svg>
          </div>

          <div
            style={{
              fontSize: '32px',
              fontWeight: '600',
              color: '#d4af37',
            }}
          >
            WatchBiz
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
