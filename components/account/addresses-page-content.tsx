'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Address } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { AddressCard } from '@/components/checkout/address-card'
import { Plus, MapPin } from 'lucide-react'

// Lazy load du modal (formulaire lourd)
const AddressFormModal = dynamic(
  () => import('@/components/checkout/address-form-modal').then(mod => ({ default: mod.AddressFormModal })),
  { ssr: false }
)

interface AddressesPageContentProps {
  addresses: Address[]
}

/**
 * 📍 Addresses Page Content (Client Component)
 *
 * Gère les états et actions pour la page adresses
 */
export function AddressesPageContent({ addresses: initialAddresses }: AddressesPageContentProps) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const handleAddAddress = () => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingAddress(null)
  }

  const handleSuccess = () => {
    // Reload page to fetch updated addresses
    window.location.reload()
  }

  return (
    <>
      {/* Add Address Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <Button onClick={handleAddAddress} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Ajouter une nouvelle adresse
        </Button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <MapPin className="h-16 w-16 text-slate-mid mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
            Aucune adresse enregistrée
          </h3>
          <p className="text-slate-mid mb-6">
            Ajoutez une adresse pour faciliter vos prochaines commandes.
          </p>
          <Button onClick={handleAddAddress}>
            <Plus className="mr-2 h-5 w-5" />
            Ajouter une adresse
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              selected={false}
              onEdit={() => handleEditAddress(address)}
              onDelete={handleSuccess} // Reload after delete
              showActions={true}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AddressFormModal
        open={isModalOpen}
        onClose={handleModalClose}
        address={editingAddress}
        onSuccess={handleSuccess}
      />
    </>
  )
}
