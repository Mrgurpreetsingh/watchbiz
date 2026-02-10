'use client'

/**
 * 💳 Section Paiement du Checkout
 *
 * Affiche récap adresse/shipping et bouton "Payer avec Stripe"
 */

import { type Address } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreditCard, MapPin, Truck, Loader2, ShieldCheck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import {
  ShippingMethod,
  SHIPPING_OPTIONS
} from '@/types/checkout'

interface PaymentSectionProps {
  address: Address | null
  shippingMethod: ShippingMethod | null
  onPayment: () => void
  isProcessing?: boolean
  disabled?: boolean
}

export function PaymentSection({
  address,
  shippingMethod,
  onPayment,
  isProcessing = false,
  disabled = false
}: PaymentSectionProps) {
  const shippingOption = SHIPPING_OPTIONS.find(
    (opt) => opt.method === shippingMethod
  )

  const isReady = address && shippingMethod

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gold-champagne/10 flex items-center justify-center">
          <CreditCard className="h-5 w-5 text-gold-champagne" />
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold">Paiement</h3>
          <p className="text-sm text-slate-mid">Vérifiez et finalisez votre commande</p>
        </div>
      </div>

      {/* Récap Adresse */}
      {address && (
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="flex items-start gap-3 mb-3">
            <MapPin className="h-5 w-5 text-gold-champagne flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-luxury-black mb-2">
                Adresse de livraison
              </h4>
              <div className="text-sm text-slate-premium space-y-1">
                <p className="font-medium">{address.fullName}</p>
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
          </div>
        </div>
      )}

      {/* Récap Livraison */}
      {shippingOption && (
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="flex items-start gap-3">
            <Truck className="h-5 w-5 text-gold-champagne flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-luxury-black mb-2">
                Méthode de livraison
              </h4>
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="font-medium text-luxury-black">
                    {shippingOption.label}
                  </p>
                  <p className="text-slate-mid">
                    Délai estimé : {shippingOption.estimatedDays}
                  </p>
                </div>
                <span className="font-semibold">
                  {formatPrice(shippingOption.price)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Info sécurité Stripe */}
      <div className="bg-slate-light/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-gold-champagne flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-premium">
            <p className="font-semibold text-luxury-black mb-2">
              Paiement 100% sécurisé
            </p>
            <p className="mb-2">
              Vous serez redirigé vers Stripe pour effectuer le paiement en toute
              sécurité. Vos données bancaires ne sont jamais stockées sur nos
              serveurs.
            </p>
            <ul className="space-y-1 text-xs text-slate-mid">
              <li>✓ Chiffrement SSL 256-bit</li>
              <li>✓ Certification PCI DSS Level 1</li>
              <li>✓ 3D Secure activé</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bouton Payer */}
      <div className="pt-4">
        <Button
          onClick={onPayment}
          disabled={!isReady || isProcessing || disabled}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Redirection vers Stripe...
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Payer avec Stripe
            </>
          )}
        </Button>

        {!isReady && (
          <p className="text-xs text-slate-mid text-center mt-3">
            Veuillez compléter les étapes précédentes
          </p>
        )}
      </div>
    </div>
  )
}
