'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown, Check } from 'lucide-react'

/**
 * 📋 Select Component
 *
 * Composant select personnalisé avec design luxe
 */

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  error?: boolean
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, value, onValueChange, placeholder, error, disabled, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [selectedValue, setSelectedValue] = React.useState(value || '')
    const containerRef = React.useRef<HTMLDivElement>(null)
    const selectRef = React.useRef<HTMLSelectElement>(null)

    React.useImperativeHandle(ref, () => selectRef.current!)

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value)
      }
    }, [value])

    const selectedOption = options.find((opt) => opt.value === selectedValue)

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue)
      onValueChange?.(optionValue)
      setOpen(false)
    }

    // Close on outside click
    React.useEffect(() => {
      if (!open) return

      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [open])

    // Close on Escape
    React.useEffect(() => {
      if (!open) return

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setOpen(false)
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [open])

    return (
      <div ref={containerRef} className="relative">
        {/* Hidden native select for form compatibility */}
        <select
          ref={selectRef}
          value={selectedValue}
          onChange={(e) => handleSelect(e.target.value)}
          className="sr-only"
          disabled={disabled}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom select trigger */}
        <button
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={cn(
            'flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm',
            'ring-offset-background placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-champagne focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error ? 'border-red-500' : 'border-input',
            className
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={cn(!selectedOption && 'text-muted-foreground')}>
            {selectedOption ? selectedOption.label : placeholder || 'Sélectionner...'}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 opacity-50 transition-transform',
              open && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div
            role="listbox"
            className={cn(
              'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg',
              'animate-in fade-in-0 zoom-in-95'
            )}
          >
            <div className="p-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selectedValue === option.value}
                  disabled={option.disabled}
                  onClick={() => !option.disabled && handleSelect(option.value)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left',
                    'transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-champagne',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    selectedValue === option.value
                      ? 'bg-gold-champagne/10 text-luxury-black font-medium'
                      : 'hover:bg-slate-light text-luxury-black'
                  )}
                >
                  {selectedValue === option.value && (
                    <Check className="h-4 w-4 text-gold-champagne" />
                  )}
                  <span className={cn(selectedValue !== option.value && 'ml-6')}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
