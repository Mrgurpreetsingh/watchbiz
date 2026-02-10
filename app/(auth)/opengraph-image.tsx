import { ImageResponse } from 'next/og'

/**
 * 🖼️ OpenGraph Image - Auth Pages (Login/Register)
 * Génère une image OG 1200x630 pour les pages d'authentification
 */

export const runtime = 'edge'
export const alt = 'Rejoignez WatchBiz - E-commerce de Montres de Luxe'
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
            marginBottom: '40px',
          }}
        >
          {/* Icône Watch */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
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
              <circle cx="12" cy="12" r="7" />
              <polyline points="12 9 12 12 13.5 13.5" />
            </svg>
          </div>

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

        {/* CTA Principal */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 'bold',
            color: '#f1f5f9', // slate-100
            textAlign: 'center',
            marginBottom: '25px',
          }}
        >
          Rejoignez la Collection
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '28px',
            color: '#94a3b8', // slate-400
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.5,
            marginBottom: '50px',
          }}
        >
          Accédez à notre sélection exclusive de montres de luxe
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '30px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '32px' }}>✨</div>
            <div style={{ fontSize: '22px', color: '#d4af37', fontWeight: '600' }}>
              Montres Authentiques
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '32px' }}>🎁</div>
            <div style={{ fontSize: '22px', color: '#d4af37', fontWeight: '600' }}>
              Offres Exclusives
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '32px' }}>🔐</div>
            <div style={{ fontSize: '22px', color: '#d4af37', fontWeight: '600' }}>
              Compte Sécurisé
            </div>
          </div>
        </div>

        {/* CTA Badge */}
        <div
          style={{
            padding: '18px 45px',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)',
            color: '#0f172a',
            fontSize: '26px',
            fontWeight: '700',
            boxShadow: '0 10px 40px rgba(212, 175, 55, 0.3)',
          }}
        >
          Créer mon compte gratuitement
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
