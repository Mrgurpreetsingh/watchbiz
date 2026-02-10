'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

/**
 * 📋 Dropdown Menu Component
 *
 * Composant dropdown accessible avec support clavier
 * Utilise un pattern controlled/uncontrolled
 */

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  asChild?: boolean
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  align?: 'start' | 'center' | 'end'
  sideOffset?: number
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  destructive?: boolean
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

// Context pour gérer l'état open/close
const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement>
}>({
  open: false,
  setOpen: () => {},
  triggerRef: { current: null }
})

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">{children}</div>
    </DropdownMenuContext.Provider>
  )
}

export function DropdownMenuTrigger({
  children,
  className,
  asChild,
  ...props
}: DropdownMenuTriggerProps) {
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext)

  const handleClick = () => {
    setOpen(!open)
  }

  return (
    <button
      ref={triggerRef}
      onClick={handleClick}
      aria-haspopup="true"
      aria-expanded={open}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'rounded-lg px-4 py-2',
        'text-sm font-medium',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-champagne focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuContent({
  children,
  className,
  align = 'end',
  sideOffset = 8,
  ...props
}: DropdownMenuContentProps) {
  const { open, setOpen, triggerRef } = React.useContext(DropdownMenuContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click
  React.useEffect(() => {
    if (!open) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen, triggerRef])

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, setOpen, triggerRef])

  if (!open) return null

  const alignmentClasses = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  }

  return (
    <div
      ref={contentRef}
      role="menu"
      className={cn(
        'absolute z-50 min-w-[200px] overflow-hidden',
        'rounded-lg border border-slate-200 bg-white shadow-lg',
        'animate-in fade-in-0 zoom-in-95',
        alignmentClasses[align],
        className
      )}
      style={{ top: `calc(100% + ${sideOffset}px)` }}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

export function DropdownMenuItem({
  children,
  className,
  destructive = false,
  onClick,
  ...props
}: DropdownMenuItemProps) {
  const { setOpen } = React.useContext(DropdownMenuContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
    setOpen(false)
  }

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-md',
        'text-sm text-left',
        'transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-champagne',
        destructive
          ? 'text-red-600 hover:bg-red-50'
          : 'text-luxury-black hover:bg-slate-light',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function DropdownMenuSeparator({ className, ...props }: DropdownMenuSeparatorProps) {
  return (
    <div
      role="separator"
      className={cn('my-1 h-px bg-slate-200', className)}
      {...props}
    />
  )
}

export function DropdownMenuLabel({ children, className, ...props }: DropdownMenuLabelProps) {
  return (
    <div
      className={cn('px-3 py-2 text-xs font-semibold text-slate-mid', className)}
      {...props}
    >
      {children}
    </div>
  )
}
