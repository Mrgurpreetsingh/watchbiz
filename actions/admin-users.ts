'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@prisma/client'

/**
 * 👥 Admin Users Actions
 *
 * Server Actions pour la gestion des utilisateurs (role, block/unblock)
 */

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// UPDATE USER ROLE (Admin)
// ============================================

export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<ActionResult> {
  try {
    // 1. Vérifier auth admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // 2. Empêcher l'auto-modification
    if (session.user.id === userId) {
      return { success: false, error: 'Vous ne pouvez pas modifier votre propre rôle' }
    }

    // 3. Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return { success: false, error: 'Utilisateur introuvable' }
    }

    // 4. Mettre à jour le rôle
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole }
    })

    // 5. Revalider la page
    revalidatePath('/admin/users')

    return { success: true }
  } catch (error) {
    console.error('Error updating user role:', error)
    return { success: false, error: 'Erreur lors de la mise à jour du rôle' }
  }
}

// ============================================
// TOGGLE USER BLOCK (Admin)
// ============================================

export async function toggleUserBlock(userId: string): Promise<ActionResult<boolean>> {
  try {
    // 1. Vérifier auth admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // 2. Empêcher l'auto-blocage
    if (session.user.id === userId) {
      return { success: false, error: 'Vous ne pouvez pas vous bloquer vous-même' }
    }

    // 3. Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isBlocked: true }
    })

    if (!user) {
      return { success: false, error: 'Utilisateur introuvable' }
    }

    // 4. Toggle isBlocked
    await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked }
    })

    // 5. Revalider la page
    revalidatePath('/admin/users')

    return { success: true, data: !user.isBlocked }
  } catch (error) {
    console.error('Error toggling user block:', error)
    return { success: false, error: 'Erreur lors du blocage/déblocage' }
  }
}
