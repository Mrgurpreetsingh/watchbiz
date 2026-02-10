'use client'

/**
 * 🚚 Section Livraison du Checkout
 *
 * Sélection de la méthode de livraison (Standard, Express, Premium)
 */

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Truck, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import {
  ShippingMethod,
  SHIPPING_OPTIONS,
  FREE_SHIPPING_THRESHOLD,
  type ShippingOption
} from '@/types/checkout'

interface ShippingSectionProps {
  selectedMethod: ShippingMethod | null
  onSelectMethod: (method: ShippingMethod) => void
  subtotal: number
  disabled?: boolean
  onValidate?: () => void
}

export function ShippingSection({
  selectedMethod,
  onSelectMethod,
  subtotal,
  disabled = false,
  onValidate
}: ShippingSectionProps) {
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD

  const getShippingPrice = (option: ShippingOption) => {
    return isFreeShipping ? 0 : option.price
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gold-champagne/10 flex items-center justify-center">
          <Truck className="h-5 w-5 text-gold-champagne" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold">Méthode de livraison</h3>
          <p className="text-sm text-slate-mid">Choisissez votre mode de livraison</p>
        </div>
      </div>

      {/* Free shipping badge */}
      {isFreeShipping && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">
            ✨ Livraison gratuite ! Votre commande dépasse {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </p>
        </div>
      )}

      {/* RadioGroup shipping options */}
      <RadioGroup
        value={selectedMethod || ''}
        onValueChange={(value) => onSelectMethod(value as ShippingMethod)}
        className="space-y-3"
      >
        {SHIPPING_OPTIONS.map((option) => {
          const price = getShippingPrice(option)

          return (
            <div
              key={option.method}
              className={`relative rounded-lg border-2 p-4 transition-all duration-200 ${
                selectedMethod === option.method
                  ? 'border-gold-champagne bg-gold-champagne/5'
                  : 'border-border bg-white hover:border-gold-champagne/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <RadioGroupItem
                value={option.method}
                disabled={disabled}
                className="absolute top-4 left-4"
              >
                <div className="flex items-start gap-4 pl-8">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <Clock className="h-5 w-5 text-gold-champagne" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-luxury-black">
                        {option.label}
                      </h4>
                      <span className="font-accent font-semibold text-luxury-black">
                        {price === 0 ? (
                          <span className="text-green-600">Gratuit</span>
                        ) : (
                          formatPrice(price)
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-slate-mid mb-1">
                      Délai estimé : {option.estimatedDays}
                    </p>
                    <p className="text-xs text-slate-premium">
                      {option.description}
                    </p>
                  </div>
                </div>
              </RadioGroupItem>
            </div>
          )
        })}
      </RadioGroup>

      {/* Bouton Continuer */}
      {selectedMethod && onValidate && (
        <div className="flex justify-end pt-4">
          <Button onClick={onValidate} size="lg" disabled={disabled}>
            Continuer vers le paiement →
          </Button>
        </div>
      )}
    </div>
  )
}
