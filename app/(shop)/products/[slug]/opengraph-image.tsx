import { ImageResponse } from 'next/og'
import prisma from '@/lib/prisma'

/**
 * 🖼️ OpenGraph Image - Product Detail
 * Génère une image OG 1200x630 dynamique pour chaque produit
 */

export const runtime = 'edge'
export const alt = 'Montre de Luxe - WatchBiz'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface Props {
  params: Promise<{
    slug: string
  }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params

  // Fetch product data
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, category: true },
  })

  if (!product) {
    // Fallback si produit non trouvé
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            color: '#f1f5f9',
            fontSize: '48px',
          }}
        >
          Produit non trouvé
        </div>
      ),
      { ...size }
    )
  }

  const formattedPrice = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price)

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          backgroundColor: '#0f172a', // slate-900
          backgroundImage: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        }}
      >
        {/* Left Side - Informations */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '80px 60px',
          }}
        >
          {/* Brand */}
          <div
            style={{
              fontSize: '28px',
              color: '#d4af37', // gold-champagne
              fontWeight: '600',
              marginBottom: '20px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {product.brand.name}
          </div>

          {/* Product Name */}
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#f1f5f9', // slate-100
              lineHeight: 1.2,
              marginBottom: '30px',
              maxWidth: '500px',
            }}
          >
            {product.name}
          </div>

          {/* Category */}
          <div
            style={{
              fontSize: '22px',
              color: '#94a3b8', // slate-400
              marginBottom: '30px',
            }}
          >
            {product.category.name}
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: '52px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '30px',
            }}
          >
            {formattedPrice}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              marginTop: '20px',
            }}
          >
            {/* Watch Icon */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid #d4af37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="24"
                height="24"
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
                fontSize: '24px',
                fontWeight: '600',
                color: '#d4af37',
              }}
            >
              WatchBiz
            </div>
          </div>
        </div>

        {/* Right Side - Pattern décoratif */}
        <div
          style={{
            width: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Cercles décoratifs */}
          <div
            style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              border: '2px solid rgba(212, 175, 55, 0.2)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: '2px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 100%)',
              display: 'flex',
              opacity: 0.9,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
