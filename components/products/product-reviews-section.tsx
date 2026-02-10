import { auth } from '@/lib/auth'
import { getProductReviews, canUserReview } from '@/actions/reviews'
import { ReviewsList } from '@/components/reviews/reviews-list'
import { ReviewForm } from '@/components/reviews/review-form'
import { Separator } from '@/components/ui/separator'
import { Star, Lock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ProductReviewsSectionProps {
  productId: string
}

/**
 * ⭐ Product Reviews Section
 *
 * Server Component qui fetch les reviews et affiche le formulaire si éligible
 */
export async function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const session = await auth()

  // Fetch reviews
  const reviewsResult = await getProductReviews(productId)

  if (!reviewsResult.success || !reviewsResult.data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
        Erreur lors du chargement des avis.
      </div>
    )
  }

  const { reviews, totalReviews, averageRating, ratingCounts } = reviewsResult.data

  // Check if user can review
  const canReviewResult = await canUserReview(productId)
  const canReview = canReviewResult.success && canReviewResult.data?.canReview
  const reason = canReviewResult.data?.reason

  return (
    <div className="space-y-8">
      {/* Section Title */}
      <div className="flex items-center gap-3">
        <Star className="h-6 w-6 text-gold-champagne" />
        <h2 className="font-heading text-3xl font-bold text-luxury-black">
          Avis Clients
        </h2>
      </div>

      <Separator />

      {/* Reviews List */}
      <ReviewsList
        reviews={reviews}
        totalReviews={totalReviews}
        averageRating={averageRating}
        ratingCounts={ratingCounts}
      />

      <Separator />

      {/* Review Form or Login Prompt */}
      {session?.user ? (
        canReview ? (
          <ReviewForm productId={productId} />
        ) : reason === 'already_reviewed' ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-6 text-center">
            <Star className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <p className="font-medium">
              Vous avez déjà laissé un avis pour ce produit.
            </p>
          </div>
        ) : null
      ) : (
        <div className="bg-slate-light/50 border border-slate-200 rounded-lg p-8 text-center">
          <Lock className="h-12 w-12 text-slate-mid mx-auto mb-3" />
          <h3 className="font-heading text-lg font-bold text-luxury-black mb-2">
            Connectez-vous pour laisser un avis
          </h3>
          <p className="text-slate-mid mb-4">
            Vous devez être connecté pour partager votre expérience
          </p>
          <Button asChild>
            <Link href={`/login?callbackUrl=/products/${productId}`}>
              Se connecter
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
