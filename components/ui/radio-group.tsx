import * as React from 'react'
import { cn } from '@/lib/utils'

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function RadioGroup({
  value,
  onValueChange,
  children,
  className
}: RadioGroupProps) {
  return (
    <div role="radiogroup" className={cn('space-y-2', className)}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            checked: child.props.value === value,
            onChange: () => onValueChange(child.props.value)
          })
        }
        return child
      })}
    </div>
  )
}

interface RadioGroupItemProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
}

export const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  RadioGroupItemProps
>(({ className, ...props }, ref) => {
  return (
    <input
      type="radio"
      ref={ref}
      className={cn(
        'h-4 w-4 border-2 border-border text-gold-champagne',
        'focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
})

RadioGroupItem.displayName = 'RadioGroupItem'
