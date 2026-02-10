import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  interactive?: boolean
  onChange?: (rating: number) => void
}

/**
 * ⭐ Star Rating Component
 *
 * Affiche une notation en étoiles (static ou interactive)
 */
export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  interactive = false,
  onChange
}: StarRatingProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  const iconSize = sizeClasses[size]

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxRating }).map((_, index) => {
          const isFilled = index < Math.floor(rating)
          const isPartial = index < rating && index >= Math.floor(rating)
          const partialPercentage = ((rating - Math.floor(rating)) * 100).toFixed(0)

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              disabled={!interactive}
              className={cn(
                'relative',
                interactive && 'cursor-pointer hover:scale-110 transition-transform',
                !interactive && 'cursor-default'
              )}
              aria-label={`${index + 1} star${index + 1 > 1 ? 's' : ''}`}
            >
              {/* Background (empty star) */}
              <Star
                className={cn(iconSize, 'text-slate-300')}
                fill="currentColor"
              />

              {/* Foreground (filled star) */}
              <div
                className="absolute top-0 left-0 overflow-hidden"
                style={{
                  width: isFilled ? '100%' : isPartial ? `${partialPercentage}%` : '0%'
                }}
              >
                <Star
                  className={cn(iconSize, 'text-gold-champagne')}
                  fill="currentColor"
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Value */}
      {showValue && (
        <span className="text-sm font-medium text-luxury-black ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
