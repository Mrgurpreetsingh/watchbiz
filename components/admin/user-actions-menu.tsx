'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { updateUserRole, toggleUserBlock } from '@/actions/admin-users'
import { useToast } from '@/lib/hooks/use-toast'
import { MoreVertical, ShieldCheck, User as UserIcon, Ban, CheckCircle, Loader2 } from 'lucide-react'
import { UserRole } from '@prisma/client'

/**
 * 👥 User Actions Menu
 *
 * Dropdown menu pour gérer les utilisateurs (role, block/unblock)
 */

interface UserActionsMenuProps {
  userId: string
  userName: string
  currentRole: UserRole
  isBlocked: boolean
  isCurrentUser: boolean
}

export function UserActionsMenu({
  userId,
  userName,
  currentRole,
  isBlocked,
  isCurrentUser
}: UserActionsMenuProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { error: showError, success: showSuccess } = useToast()

  // Dialog states
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)

  // Handle role change
  const handleRoleChange = () => {
    startTransition(async () => {
      const newRole = currentRole === 'ADMIN' ? UserRole.USER : UserRole.ADMIN
      const result = await updateUserRole(userId, newRole)

      if (result.success) {
        showSuccess(
          'Rôle modifié',
          `${userName} est maintenant ${newRole === 'ADMIN' ? 'administrateur' : 'utilisateur'}`
        )
        setRoleDialogOpen(false)
        router.refresh()
      } else {
        showError('Erreur', result.error || 'Impossible de modifier le rôle')
      }
    })
  }

  // Handle block/unblock
  const handleToggleBlock = () => {
    startTransition(async () => {
      const result = await toggleUserBlock(userId)

      if (result.success) {
        const newBlockedState = result.data as boolean
        showSuccess(
          newBlockedState ? 'Utilisateur bloqué' : 'Utilisateur débloqué',
          `${userName} a été ${newBlockedState ? 'bloqué' : 'débloqué'} avec succès`
        )
        setBlockDialogOpen(false)
        router.refresh()
      } else {
        showError('Erreur', result.error || 'Impossible de bloquer/débloquer')
      }
    })
  }

  // Disable if current user
  if (isCurrentUser) {
    return (
      <Button variant="ghost" size="sm" disabled title="Vous ne pouvez pas vous modifier vous-même">
        <MoreVertical className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Change Role */}
          <DropdownMenuItem onClick={() => setRoleDialogOpen(true)}>
            {currentRole === 'ADMIN' ? (
              <>
                <UserIcon className="mr-2 h-4 w-4" />
                Rétrograder en utilisateur
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Promouvoir en admin
              </>
            )}
          </DropdownMenuItem>

          {/* Block/Unblock */}
          <DropdownMenuItem
            onClick={() => setBlockDialogOpen(true)}
            className={isBlocked ? 'text-green-600' : 'text-red-600'}
          >
            {isBlocked ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Débloquer
              </>
            ) : (
              <>
                <Ban className="mr-2 h-4 w-4" />
                Bloquer
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Change Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentRole === 'ADMIN' ? 'Rétrograder en utilisateur' : 'Promouvoir en admin'}
            </DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir changer le rôle de <strong>{userName}</strong> en{' '}
              <strong>{currentRole === 'ADMIN' ? 'utilisateur' : 'administrateur'}</strong> ?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRoleDialogOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button onClick={handleRoleChange} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                'Confirmer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isBlocked ? 'Débloquer' : 'Bloquer'} l&apos;utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir {isBlocked ? 'débloquer' : 'bloquer'}{' '}
              <strong>{userName}</strong> ?
              {!isBlocked && (
                <span className="block mt-2 text-red-600 font-semibold">
                  L&apos;utilisateur ne pourra plus se connecter.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBlockDialogOpen(false)}
              disabled={isPending}
            >
              Annuler
            </Button>
            <Button
              variant={isBlocked ? 'default' : 'destructive'}
              onClick={handleToggleBlock}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isBlocked ? 'Déblocage...' : 'Blocage...'}
                </>
              ) : (
                <>
                  {isBlocked ? 'Débloquer' : 'Bloquer'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
