'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

/**
 * 🚚 Update Order Tracking Number
 *
 * Admin-only action to add/update tracking number for an order
 */
export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string
): Promise<ActionResult> {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Valider le tracking number
    const schema = z.string().min(3).max(100)
    const validated = schema.safeParse(trackingNumber.trim())

    if (!validated.success) {
      return { success: false, error: 'Numéro de suivi invalide (3-100 caractères)' }
    }

    // Mettre à jour la commande
    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: validated.data,
        // Si on ajoute un tracking, mettre le statut à SHIPPED si ce n'est pas déjà fait
        status: {
          set: 'SHIPPED'
        }
      }
    })

    // Revalider les pages
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/account/orders')

    return { success: true }
  } catch (error) {
    console.error('Update tracking error:', error)
    return { success: false, error: 'Erreur lors de la mise à jour du suivi' }
  }
}

/**
 * 🗑️ Remove Order Tracking Number
 *
 * Admin-only action to remove tracking number
 */
export async function removeOrderTracking(orderId: string): Promise<ActionResult> {
  try {
    // Vérifier que l'utilisateur est admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Retirer le tracking number
    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: null
      }
    })

    // Revalider les pages
    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/account/orders')

    return { success: true }
  } catch (error) {
    console.error('Remove tracking error:', error)
    return { success: false, error: 'Erreur lors de la suppression du suivi' }
  }
}
