'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateOrderTracking, removeOrderTracking } from '@/actions/admin-tracking'
import { Loader2, Truck, X, Check } from 'lucide-react'

interface TrackingUpdaterProps {
  orderId: string
  currentTracking: string | null
}

/**
 * 🚚 Tracking Number Updater
 *
 * Allows admin to add/update/remove tracking number for an order
 */
export function TrackingUpdater({ orderId, currentTracking }: TrackingUpdaterProps) {
  const [isPending, startTransition] = useTransition()
  const [isEditing, setIsEditing] = useState(!currentTracking)
  const [trackingNumber, setTrackingNumber] = useState(currentTracking || '')
  const [error, setError] = useState<string | null>(null)

  function handleUpdate() {
    if (!trackingNumber.trim()) {
      setError('Veuillez entrer un numéro de suivi')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await updateOrderTracking(orderId, trackingNumber)

      if (result.success) {
        setIsEditing(false)
      } else {
        setError(result.error || 'Erreur lors de la mise à jour')
      }
    })
  }

  function handleRemove() {
    setError(null)
    startTransition(async () => {
      const result = await removeOrderTracking(orderId)

      if (result.success) {
        setTrackingNumber('')
        setIsEditing(true)
      } else {
        setError(result.error || 'Erreur lors de la suppression')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Display Mode */}
      {!isEditing && currentTracking && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p className="text-xs font-medium text-green-800 mb-1">Numéro de suivi</p>
              <p className="text-sm font-mono font-semibold text-green-900 break-all">
                {currentTracking}
              </p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              disabled={isPending}
              className="text-green-700 hover:text-green-900 text-sm font-medium"
            >
              Modifier
            </button>
          </div>
        </div>
      )}

      {/* Edit Mode */}
      {isEditing && (
        <>
          <div>
            <Label htmlFor="tracking">Numéro de suivi</Label>
            <Input
              id="tracking"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ex: 1234567890123456"
              disabled={isPending}
              className="mt-1"
            />
            <p className="text-xs text-slate-500 mt-1">
              Le statut de la commande passera automatiquement à "Expédiée"
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpdate}
              disabled={isPending || !trackingNumber.trim()}
              size="sm"
              className="flex-1 bg-gold-champagne hover:bg-gold-dark text-luxury-black"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>

            {currentTracking && (
              <>
                <Button
                  onClick={() => {
                    setTrackingNumber(currentTracking)
                    setIsEditing(false)
                    setError(null)
                  }}
                  disabled={isPending}
                  size="sm"
                  variant="outline"
                >
                  Annuler
                </Button>

                <Button
                  onClick={handleRemove}
                  disabled={isPending}
                  size="sm"
                  variant="destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </>
      )}

      {/* Empty State (no tracking and not editing) */}
      {!isEditing && !currentTracking && (
        <Button
          onClick={() => setIsEditing(true)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <Truck className="mr-2 h-4 w-4" />
          Ajouter un numéro de suivi
        </Button>
      )}
    </div>
  )
}
