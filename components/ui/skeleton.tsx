'use client'

/**
 * 💀 Skeleton Component - Loading states
 *
 * Animate pulse, background slate-light
 * Variants : rectangle (default), circle, text
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangle' | 'circle' | 'text'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'rectangle', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'animate-pulse bg-slate-light',
          {
            'rounded-md': variant === 'rectangle',
            'rounded-full': variant === 'circle',
            'h-4 w-full rounded': variant === 'text',
          },
          className
        )}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

export { Skeleton }
