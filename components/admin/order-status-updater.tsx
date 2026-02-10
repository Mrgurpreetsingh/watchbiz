'use client'

import { useState, useTransition } from 'react'
import { Select, SelectOption } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { updateOrderStatus } from '@/actions/admin-orders'
import { useToast } from '@/lib/hooks/use-toast'
import { OrderStatus } from '@prisma/client'
import { Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * 🔄 Order Status Updater
 *
 * Composant pour changer le statut d'une commande
 */

interface OrderStatusUpdaterProps {
  orderId: string
  currentStatus: OrderStatus
}

const statusOptions: SelectOption[] = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'PROCESSING', label: 'En traitement' },
  { value: 'SHIPPED', label: 'Expédiée' },
  { value: 'DELIVERED', label: 'Livrée' },
  { value: 'CANCELLED', label: 'Annulée' }
]

export function OrderStatusUpdater({ orderId, currentStatus }: OrderStatusUpdaterProps) {
  const [status, setStatus] = useState<string>(currentStatus)
  const [isPending, startTransition] = useTransition()
  const { error: showError, success: showSuccess } = useToast()
  const router = useRouter()

  const handleUpdate = () => {
    if (status === currentStatus) {
      showError('Aucun changement', 'Le statut est déjà à jour')
      return
    }

    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status as OrderStatus)

      if (result.success) {
        showSuccess('Statut mis à jour', 'Le statut de la commande a été modifié')
        router.refresh()
      } else {
        showError('Erreur', result.error || 'Impossible de mettre à jour le statut')
        setStatus(currentStatus) // Reset
      }
    })
  }

  return (
    <div className="space-y-4">
      <Select
        options={statusOptions}
        value={status}
        onValueChange={setStatus}
        disabled={isPending}
      />

      <Button
        onClick={handleUpdate}
        disabled={isPending || status === currentStatus}
        className="w-full"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Mise à jour...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Mettre à jour le statut
          </>
        )}
      </Button>
    </div>
  )
}
