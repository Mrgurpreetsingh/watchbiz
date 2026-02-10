'use client'

/**
 * 🖼️ Product Gallery - Galerie images produit avec thumbnails
 *
 * Features:
 * - Image principale grande (aspect-square)
 * - Thumbnails horizontales (4-5 visibles)
 * - Navigation flèches + clavier (ArrowLeft/Right)
 * - Active state sur thumbnail
 * - Zoom au clic (optionnel - peut être ajouté)
 */

import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps {
  images: string[]
  alt: string
}

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevious()
    } else if (e.key === 'ArrowRight') {
      handleNext()
    }
  }

  // Si aucune image, afficher placeholder
  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-slate-light">
        <svg
          className="h-24 w-24 text-slate-mid"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Image Principale */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-light">
        <Image
          src={images[activeIndex]}
          alt={`${alt} - Image ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {/* Navigation Flèches (si plusieurs images) */}
        {images.length > 1 && (
          <>
            {/* Flèche Gauche */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2"
              aria-label="Image précédente"
            >
              <svg
                className="h-6 w-6 text-luxury-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Flèche Droite */}
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all hover:bg-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2"
              aria-label="Image suivante"
            >
              <svg
                className="h-6 w-6 text-luxury-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Indicateur de position */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-luxury-black/70 px-3 py-1 text-xs font-medium text-white">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                index === activeIndex
                  ? 'border-gold-champagne ring-2 ring-gold-champagne/20'
                  : 'border-transparent hover:border-slate-mid'
              }`}
              aria-label={`Afficher l'image ${index + 1}`}
              aria-current={index === activeIndex}
            >
              <Image
                src={image}
                alt={`${alt} - Miniature ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
