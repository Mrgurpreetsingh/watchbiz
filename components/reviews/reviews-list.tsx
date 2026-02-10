import { Review, User } from '@prisma/client'
import { StarRating } from './star-rating'
import { ReviewCard } from './review-card'
import { Star } from 'lucide-react'

type ReviewWithUser = Review & {
  user: Pick<User, 'id' | 'name' | 'image'>
}

interface ReviewsListProps {
  reviews: ReviewWithUser[]
  totalReviews: number
  averageRating: number
  ratingCounts: Record<number, number>
}

/**
 * ⭐ Reviews List
 *
 * Affiche la liste des avis avec statistiques
 */
export function ReviewsList({
  reviews,
  totalReviews,
  averageRating,
  ratingCounts
}: ReviewsListProps) {
  if (totalReviews === 0) {
    return (
      <div className="bg-slate-light/30 rounded-lg p-12 text-center">
        <Star className="h-16 w-16 text-slate-mid mx-auto mb-4" />
        <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
          Aucun avis pour l'instant
        </h3>
        <p className="text-slate-mid">
          Soyez le premier à laisser un avis sur ce produit !
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-slate-light/30 rounded-lg p-6">
        <div className="flex items-start gap-8">
          {/* Average Rating */}
          <div className="text-center">
            <div className="font-accent text-5xl font-bold text-luxury-black mb-2">
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} size="md" />
            <p className="text-sm text-slate-mid mt-2">
              {totalReviews} avis
            </p>
          </div>

          {/* Rating Histogram */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingCounts[rating] || 0
              const percentage =
                totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0

              return (
                <div key={rating} className="flex items-center gap-3 text-sm">
                  <span className="text-luxury-black font-medium w-8">
                    {rating} ★
                  </span>

                  {/* Progress Bar */}
                  <div className="flex-1 h-3 bg-slate-300 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold-champagne transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <span className="text-slate-mid w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-heading text-xl font-bold text-luxury-black">
          Avis clients ({totalReviews})
        </h3>

        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  )
}
