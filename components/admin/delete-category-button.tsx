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
import { deleteCategory } from '@/actions/admin-categories'
import { useToast } from '@/lib/hooks/use-toast'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

/**
 * 🗑️ Delete Category Button
 *
 * Bouton de suppression de catégorie avec confirmation dialog
 */

interface DeleteCategoryButtonProps {
  categoryId: string
  categoryName: string
  productCount: number
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  productCount
}: DeleteCategoryButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { error: showError, success: showSuccess } = useToast()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(categoryId)

      if (result.success) {
        showSuccess('Catégorie supprimée', `${categoryName} a été supprimée avec succès`)
        setOpen(false)
        router.refresh()
      } else {
        showError('Erreur', result.error || 'Impossible de supprimer la catégorie')
      }
    })
  }

  // Disable button if category has products
  const isDisabled = productCount > 0

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isDisabled}
        className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title={isDisabled ? `Impossible de supprimer (${productCount} produit${productCount > 1 ? 's' : ''} lié${productCount > 1 ? 's' : ''})` : 'Supprimer'}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la catégorie</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{categoryName}</strong> ?
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
