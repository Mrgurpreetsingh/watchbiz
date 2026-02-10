'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { deleteProduct } from '@/actions/admin-products'
import { useToast } from '@/lib/hooks/use-toast'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * 🗑️ Delete Product Button
 *
 * Bouton de suppression avec confirmation dialog
 */

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { error: showError, success: showSuccess } = useToast()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProduct(productId)

      if (result.success) {
        showSuccess('Produit supprimé', `${productName} a été supprimé avec succès`)
        setOpen(false)
        router.refresh()
      } else {
        showError('Erreur', result.error || 'Impossible de supprimer le produit')
      }
    })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{productName}</strong> ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
