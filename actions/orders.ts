'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * 📦 Server Actions - Gestion Commandes Utilisateur
 */

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// GET USER ORDERS
// ============================================

export async function getUserOrders() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: true
              }
            }
          }
        },
        shippingAddress: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: orders }
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return { success: false, error: 'Erreur lors de la récupération des commandes' }
  }
}

// ============================================
// GET ORDER BY ID
// ============================================

export async function getOrderById(orderId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                images: true,
                price: true
              }
            }
          }
        },
        shippingAddress: true
      }
    })

    if (!order) {
      return { success: false, error: 'Commande introuvable' }
    }

    // Verify ownership
    if (order.userId !== session.user.id) {
      return { success: false, error: 'Accès non autorisé' }
    }

    return { success: true, data: order }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { success: false, error: 'Erreur lors de la récupération de la commande' }
  }
}
