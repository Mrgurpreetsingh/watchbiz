import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * 📝 Textarea Component
 *
 * Composant textarea stylisé avec design luxe
 */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border bg-white dark:bg-slate-800 px-3 py-2 text-sm',
          'text-luxury-black dark:text-white',
          'placeholder:text-slate-mid dark:placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-champagne focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none',
          error ? 'border-red-500' : 'border-border dark:border-slate-700',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'
