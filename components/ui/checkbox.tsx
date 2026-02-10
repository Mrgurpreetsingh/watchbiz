import * as React from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative inline-flex">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            'peer h-5 w-5 shrink-0 rounded border-2 border-border',
            'focus:outline-none focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2',
            'checked:bg-gold-champagne checked:border-gold-champagne',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        <Check className="absolute inset-0 h-5 w-5 p-0.5 text-luxury-black opacity-0 peer-checked:opacity-100 pointer-events-none" />
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
