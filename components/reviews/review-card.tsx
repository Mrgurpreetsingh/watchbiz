import { Review, User } from '@prisma/client'
import { StarRating } from './star-rating'
import { Badge } from '@/components/ui/badge'
import { User as UserIcon, CheckCircle } from 'lucide-react'

type ReviewWithUser = Review & {
  user: Pick<User, 'id' | 'name' | 'image'>
}

interface ReviewCardProps {
  review: ReviewWithUser
}

/**
 * 💬 Review Card
 *
 * Affiche un avis utilisateur avec avatar, note, titre, commentaire
 */
export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header : Avatar + Name + Rating */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full bg-slate-light flex items-center justify-center overflow-hidden flex-shrink-0">
          {review.user.image ? (
            <img
              src={review.user.image}
              alt={review.user.name || 'User'}
              className="h-full w-full object-cover"
            />
          ) : (
            <UserIcon className="h-6 w-6 text-slate-mid" />
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-luxury-black">
              {review.user.name || 'Utilisateur'}
            </p>
            {review.isVerified && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Achat vérifié
              </Badge>
            )}
          </div>

          {/* Rating */}
          <StarRating rating={review.rating} size="sm" />

          {/* Date */}
          <p className="text-xs text-slate-mid mt-1">
            {new Date(review.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Title */}
      {review.title && (
        <h4 className="font-semibold text-luxury-black mb-2">
          {review.title}
        </h4>
      )}

      {/* Comment */}
      <p className="text-slate-mid leading-relaxed whitespace-pre-wrap">
        {review.comment}
      </p>
    </div>
  )
}
