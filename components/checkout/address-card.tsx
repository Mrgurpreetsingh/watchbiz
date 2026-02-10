'use client'

/**
 * 🏠 Carte Adresse pour le checkout
 *
 * Affiche une adresse avec sélection radio, badge "Par défaut", et actions Edit/Delete
 */

import { type Address } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { Check, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddressCardProps {
  address: Address
  selected?: boolean
  onSelect?: () => void
  onEdit?: () => void
  onDelete?: () => void
  showActions?: boolean
}

export function AddressCard({
  address,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  showActions = true
}: AddressCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200',
        'hover:border-gold-champagne/50',
        selected
          ? 'border-gold-champagne bg-gold-champagne/5'
          : 'border-border bg-white'
      )}
    >
      {/* Badge "Par défaut" */}
      {address.isDefault && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-gold-champagne/10 text-gold-champagne border-gold-champagne/20">
            Par défaut
          </Badge>
        </div>
      )}

      {/* Checkmark si sélectionné */}
      {selected && (
        <div className="absolute top-4 left-4">
          <div className="h-6 w-6 rounded-full bg-gold-champagne flex items-center justify-center">
            <Check className="h-4 w-4 text-luxury-black" />
          </div>
        </div>
      )}

      {/* Contenu adresse */}
      <div className={cn('space-y-2', selected && 'pl-10')}>
        <div className="font-heading font-semibold text-luxury-black">
          {address.fullName}
        </div>
        <div className="text-sm text-slate-premium space-y-1">
          <p>{address.street}</p>
          <p>
            {address.postalCode} {address.city}
          </p>
          <p>
            {address.state}, {address.country}
          </p>
          <p className="text-slate-mid">Tél : {address.phone}</p>
        </div>
      </div>

      {/* Actions Edit/Delete */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-border flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit?.()
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-premium hover:text-gold-champagne transition-colors"
          >
            <Pencil className="h-4 w-4" />
            <span>Modifier</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete?.()
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-mid hover:text-ruby-red transition-colors ml-auto"
          >
            <Trash2 className="h-4 w-4" />
            <span>Supprimer</span>
          </button>
        </div>
      )}
    </div>
  )
}
