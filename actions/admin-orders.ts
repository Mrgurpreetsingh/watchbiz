'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { OrderStatus, PaymentStatus } from '@prisma/client'

/**
 * 📦 Admin Orders Actions
 *
 * Server Actions pour la gestion des commandes admin
 */

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// GET ALL ORDERS (Admin) with Filters
// ============================================

interface GetAdminOrdersFilters {
  search?: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
}

export async function getAdminOrders(filters: GetAdminOrdersFilters = {}) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Build where clause
    const where: any = {}

    // Search filter (order number or customer email/name)
    if (filters.search) {
      where.OR = [
        { orderNumber: { contains: filters.search, mode: 'insensitive' } },
        { user: { email: { contains: filters.search, mode: 'insensitive' } } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } }
      ]
    }

    // Status filter
    if (filters.status) {
      where.status = filters.status
    }

    // Payment status filter
    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
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
    console.error('Error fetching admin orders:', error)
    return { success: false, error: 'Erreur lors du chargement des commandes' }
  }
}

// ============================================
// GET ORDER BY ID (Admin)
// ============================================

export async function getAdminOrderById(orderId: string) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
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

    return { success: true, data: order }
  } catch (error) {
    console.error('Error fetching admin order:', error)
    return { success: false, error: 'Erreur lors du chargement de la commande' }
  }
}

// ============================================
// UPDATE ORDER STATUS
// ============================================

const updateOrderStatusSchema = z.object({
  orderId: z.string().cuid(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
})

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Validation
    const validation = updateOrderStatusSchema.safeParse({ orderId, status })
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return { success: false, error: 'Commande introuvable' }
    }

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    revalidatePath('/admin/orders')
    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath('/account/orders')

    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Erreur lors de la mise à jour du statut' }
  }
}
