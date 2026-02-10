import { ImageResponse } from 'next/og'

/**
 * 🖼️ OpenGraph Image - Homepage
 * Génère une image OG 1200x630 pour le partage sur les réseaux sociaux
 */

export const runtime = 'edge'
export const alt = 'WatchBiz - E-commerce de Montres de Luxe'
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
          {/* Icône Watch stylisée */}
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
              <path d="M16.51 17.35l-1.42 1.42" />
              <path d="M7.49 6.65l-1.42-1.42" />
              <path d="M16.51 6.65l1.42-1.42" />
              <path d="M7.49 17.35l-1.42 1.42" />
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

        {/* Tagline */}
        <div
          style={{
            fontSize: '36px',
            color: '#f1f5f9', // slate-100
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          E-commerce moderne de montres de luxe
        </div>

        {/* Sous-titre tech stack */}
        <div
          style={{
            fontSize: '22px',
            color: '#94a3b8', // slate-400
            marginTop: '20px',
            textAlign: 'center',
          }}
        >
          Next.js • TypeScript • Tailwind CSS • Prisma • PostgreSQL
        </div>

        {/* Badge */}
        <div
          style={{
            marginTop: '40px',
            padding: '12px 30px',
            borderRadius: '999px',
            border: '2px solid #d4af37',
            color: '#d4af37',
            fontSize: '20px',
            fontWeight: '600',
          }}
        >
          ✨ Collection Exclusive
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
