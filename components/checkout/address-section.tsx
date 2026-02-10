'use client'

/**
 * 🏠 Section Adresse du Checkout
 *
 * Affiche toutes les adresses, permet de sélectionner, créer, modifier, supprimer
 */

import dynamic from 'next/dynamic'
import { useState, useEffect, useTransition } from 'react'
import { type Address } from '@prisma/client'
import { AddressCard } from './address-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, MapPin } from 'lucide-react'
import { getUserAddresses, deleteAddress } from '@/actions/addresses'

// Lazy load du modal (formulaire lourd)
const AddressFormModal = dynamic(
  () => import('./address-form-modal').then(mod => ({ default: mod.AddressFormModal })),
  { ssr: false }
)

interface AddressSectionProps {
  selectedAddressId: string | null
  onSelectAddress: (addressId: string) => void
  onValidate?: () => void
}

export function AddressSection({
  selectedAddressId,
  onSelectAddress,
  onValidate
}: AddressSectionProps) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | undefined>()
  const [isPending, startTransition] = useTransition()

  // Fetch addresses au mount
  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = async () => {
    setIsLoading(true)
    const result = await getUserAddresses()
    if (result.success && result.data) {
      setAddresses(result.data)

      // Sélectionner automatiquement l'adresse par défaut si aucune sélection
      if (!selectedAddressId) {
        const defaultAddr = result.data.find(addr => addr.isDefault)
        if (defaultAddr) {
          onSelectAddress(defaultAddr.id)
        }
      }
    }
    setIsLoading(false)
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setIsModalOpen(true)
  }

  const handleDelete = (addressId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      return
    }

    startTransition(async () => {
      const result = await deleteAddress(addressId)
      if (result.success) {
        // Reload addresses
        await loadAddresses()

        // Si l'adresse supprimée était sélectionnée, désélectionner
        if (selectedAddressId === addressId) {
          onSelectAddress('')
        }
      }
    })
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingAddress(undefined)
  }

  const handleModalSuccess = async () => {
    await loadAddresses()
  }

  const handleNewAddress = () => {
    setEditingAddress(undefined)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gold-champagne/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-gold-champagne" />
          </div>
          <div>
            <h3 className="font-heading text-xl font-semibold">Adresse de livraison</h3>
            <p className="text-sm text-slate-mid">Sélectionnez ou ajoutez une adresse</p>
          </div>
        </div>

        <Button
          onClick={handleNewAddress}
          variant="outline"
          size="sm"
          disabled={isPending}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle adresse
        </Button>
      </div>

      {/* Liste des adresses */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 bg-slate-light/30 rounded-lg border-2 border-dashed border-border">
          <MapPin className="h-12 w-12 text-slate-mid mx-auto mb-4" />
          <p className="text-slate-premium mb-4">Aucune adresse enregistrée</p>
          <Button onClick={handleNewAddress}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une adresse
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={selectedAddressId === address.id}
              onSelect={() => onSelectAddress(address.id)}
              onEdit={() => handleEdit(address)}
              onDelete={() => handleDelete(address.id)}
              showActions
            />
          ))}
        </div>
      )}

      {/* Bouton Continuer (si adresse sélectionnée) */}
      {selectedAddressId && onValidate && (
        <div className="flex justify-end pt-4">
          <Button onClick={onValidate} size="lg">
            Continuer vers la livraison →
          </Button>
        </div>
      )}

      {/* Modal formulaire */}
      <AddressFormModal
        open={isModalOpen}
        onClose={handleModalClose}
        address={editingAddress}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
