'use client'

/**
 * 🛒 Formulaire Checkout Principal
 *
 * Orchestre les 3 sections avec progressive disclosure :
 * 1. Adresse (toujours visible)
 * 2. Livraison (unlock après adresse sélectionnée)
 * 3. Paiement (unlock après livraison sélectionnée)
 */

import { useState, useEffect, useTransition } from 'react'
import { type Address } from '@prisma/client'
import { AddressSection } from './address-section'
import { ShippingSection } from './shipping-section'
import { PaymentSection } from './payment-section'
import { OrderSummary } from './order-summary'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/store/cart-store'
import { ShippingMethod } from '@/types/checkout'
import { getUserAddresses } from '@/actions/addresses'
import { createCheckoutSession } from '@/actions/checkout'

export function CheckoutForm() {
  // State
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod | null>(null)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [isPending, startTransition] = useTransition()

  const { getTotalPrice } = useCartStore()
  const subtotal = getTotalPrice()

  // Fetch address details when selectedAddressId changes
  useEffect(() => {
    if (!selectedAddressId) {
      setSelectedAddress(null)
      return
    }

    const fetchAddress = async () => {
      const result = await getUserAddresses()
      if (result.success && result.data) {
        const addr = result.data.find((a) => a.id === selectedAddressId)
        setSelectedAddress(addr || null)
      }
    }

    fetchAddress()
  }, [selectedAddressId])

  // Progressive disclosure logic
  const handleAddressValidate = () => {
    if (selectedAddressId) {
      setCurrentStep(2)
    }
  }

  const handleShippingValidate = () => {
    if (shippingMethod) {
      setCurrentStep(3)
    }
  }

  const handlePayment = () => {
    if (!selectedAddressId || !shippingMethod) {
      alert('Veuillez compléter toutes les étapes avant de payer')
      return
    }

    const { items } = useCartStore.getState()

    if (items.length === 0) {
      alert('Votre panier est vide')
      return
    }

    startTransition(async () => {
      // Créer la session Stripe Checkout
      const result = await createCheckoutSession(
        selectedAddressId,
        shippingMethod,
        items
      )

      if (result.success && result.data?.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = result.data.url
      } else {
        alert(
          `Erreur lors de la création du paiement:\n${result.error || 'Erreur inconnue'}`
        )
      }
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Main Content (2/3) */}
      <div className="lg:col-span-2 space-y-8">
        {/* Section 1 : Adresse (toujours visible) */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6">
          <AddressSection
            selectedAddressId={selectedAddressId}
            onSelectAddress={setSelectedAddressId}
            onValidate={handleAddressValidate}
          />
        </div>

        {currentStep >= 2 && (
          <>
            <Separator className="my-8" />

            {/* Section 2 : Livraison */}
            <div className="bg-white rounded-lg border border-border shadow-sm p-6">
              <ShippingSection
                selectedMethod={shippingMethod}
                onSelectMethod={setShippingMethod}
                subtotal={subtotal}
                disabled={!selectedAddressId}
                onValidate={handleShippingValidate}
              />
            </div>
          </>
        )}

        {currentStep >= 3 && (
          <>
            <Separator className="my-8" />

            {/* Section 3 : Paiement */}
            <div className="bg-white rounded-lg border border-border shadow-sm p-6">
              <PaymentSection
                address={selectedAddress}
                shippingMethod={shippingMethod}
                onPayment={handlePayment}
                isProcessing={isPending}
                disabled={!selectedAddressId || !shippingMethod}
              />
            </div>
          </>
        )}

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-2 w-2 rounded-full transition-all ${
                step <= currentStep
                  ? 'bg-gold-champagne w-8'
                  : 'bg-slate-light'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Sidebar Summary (1/3) */}
      <div className="lg:col-span-1">
        <OrderSummary shippingMethod={shippingMethod} />
      </div>
    </div>
  )
}
