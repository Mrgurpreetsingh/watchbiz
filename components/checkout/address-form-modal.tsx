'use client'

/**
 * 🏠 Modal Formulaire Adresse
 *
 * Dialog avec formulaire pour créer ou éditer une adresse
 * Validation Zod côté serveur via Server Actions
 */

import { useState, useTransition } from 'react'
import { type Address } from '@prisma/client'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { createAddress, updateAddress } from '@/actions/addresses'

interface AddressFormModalProps {
  open: boolean
  onClose: () => void
  address?: Address // Si fourni, mode édition
  onSuccess?: () => void
}

export function AddressFormModal({
  open,
  onClose,
  address,
  onSuccess
}: AddressFormModalProps) {
  const isEditMode = !!address
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = isEditMode
        ? await updateAddress(address.id, formData)
        : await createAddress(formData)

      if (result.success) {
        onSuccess?.()
        onClose()
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditMode ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nom complet */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Nom complet <span className="text-ruby-red">*</span>
          </Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            required
            defaultValue={address?.fullName}
            placeholder="Jean Dupont"
            error={!!error}
          />
        </div>

        {/* Téléphone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Téléphone <span className="text-ruby-red">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            defaultValue={address?.phone}
            placeholder="0612345678"
            error={!!error}
          />
        </div>

        {/* Adresse */}
        <div className="space-y-2">
          <Label htmlFor="street">
            Adresse <span className="text-ruby-red">*</span>
          </Label>
          <Input
            id="street"
            name="street"
            type="text"
            required
            defaultValue={address?.street}
            placeholder="123 Rue de la Paix"
            error={!!error}
          />
        </div>

        {/* Ville & Code postal (grid 2 cols) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">
              Ville <span className="text-ruby-red">*</span>
            </Label>
            <Input
              id="city"
              name="city"
              type="text"
              required
              defaultValue={address?.city}
              placeholder="Paris"
              error={!!error}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">
              Code postal <span className="text-ruby-red">*</span>
            </Label>
            <Input
              id="postalCode"
              name="postalCode"
              type="text"
              required
              pattern="\d{5}"
              defaultValue={address?.postalCode}
              placeholder="75001"
              error={!!error}
            />
          </div>
        </div>

        {/* Région & Pays (grid 2 cols) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="state">
              Région <span className="text-ruby-red">*</span>
            </Label>
            <Input
              id="state"
              name="state"
              type="text"
              required
              defaultValue={address?.state}
              placeholder="Île-de-France"
              error={!!error}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">
              Pays <span className="text-ruby-red">*</span>
            </Label>
            <Input
              id="country"
              name="country"
              type="text"
              required
              defaultValue={address?.country || 'France'}
              placeholder="France"
              error={!!error}
            />
          </div>
        </div>

        {/* Adresse par défaut */}
        <div className="flex items-center gap-3 pt-2">
          <Checkbox
            id="isDefault"
            name="isDefault"
            value="true"
            defaultChecked={address?.isDefault}
          />
          <Label htmlFor="isDefault" className="cursor-pointer">
            Définir comme adresse par défaut
          </Label>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-ruby-red/10 border border-ruby-red/20 rounded-md p-4">
            <p className="text-sm text-ruby-red">{error}</p>
          </div>
        )}

        {/* Boutons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isPending} className="flex-1">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditMode ? 'Modification...' : 'Création...'}
              </>
            ) : (
              <>{isEditMode ? 'Modifier' : 'Créer'}</>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
