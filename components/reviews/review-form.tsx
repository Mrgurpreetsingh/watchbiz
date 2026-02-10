'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createReview } from '@/actions/reviews'
import { Star, Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  productId: string
  onSuccess?: () => void
}

/**
 * ✍️ Review Form
 *
 * Formulaire pour laisser un avis
 */
export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (rating === 0) {
      setError('Veuillez sélectionner une note')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('productId', productId)
    formData.set('rating', rating.toString())

    startTransition(async () => {
      const result = await createReview(formData)

      if (result.success) {
        setSuccess(true)
        setRating(0)
        e.currentTarget.reset()
        onSuccess?.()
        // Reload page after 2s
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(result.error || 'Une erreur est survenue')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
      <div>
        <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
          Laisser un avis
        </h3>
        <p className="text-sm text-slate-mid">
          Partagez votre expérience avec ce produit
        </p>
      </div>

      {/* Rating Stars (Interactive) */}
      <div>
        <Label>Note *</Label>
        <div className="flex items-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((value) => {
            const isFilled = value <= (hoveredRating || rating)

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                onMouseLeave={() => setHoveredRating(0)}
                className="hover:scale-125 transition-transform"
                aria-label={`${value} star${value > 1 ? 's' : ''}`}
              >
                <Star
                  className={cn(
                    'h-8 w-8 transition-colors',
                    isFilled ? 'text-gold-champagne' : 'text-slate-300'
                  )}
                  fill={isFilled ? 'currentColor' : 'none'}
                />
              </button>
            )
          })}

          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-luxury-black">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      {/* Title (Optional) */}
      <div>
        <Label htmlFor="title">Titre (optionnel)</Label>
        <Input
          id="title"
          name="title"
          type="text"
          placeholder="Ex: Excellent produit !"
          maxLength={100}
          disabled={isPending}
        />
      </div>

      {/* Comment */}
      <div>
        <Label htmlFor="comment">Votre avis *</Label>
        <textarea
          id="comment"
          name="comment"
          rows={5}
          placeholder="Partagez votre expérience avec ce produit..."
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-champagne focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
          minLength={10}
          maxLength={1000}
          disabled={isPending}
        />
        <p className="text-xs text-slate-mid mt-1">
          Minimum 10 caractères, maximum 1000 caractères
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 text-sm">
          ✅ Merci pour votre avis ! Il a été publié avec succès.
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending || rating === 0}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Publication en cours...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Publier l'avis
          </>
        )}
      </Button>
    </form>
  )
}
