'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

/**
 * 📊 Admin Stats Actions
 *
 * Server Actions pour récupérer les statistiques admin
 */

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  recentOrders: {
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: Date
    user: {
      name: string | null
      email: string
    }
  }[]
  topProducts: {
    id: string
    name: string
    slug: string
    totalSales: number
    revenue: number
  }[]
  monthlyRevenue: {
    month: string
    revenue: number
  }[]
}

export async function getDashboardStats() {
  try {
    const session = await auth()

    // Check admin role
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // 1. Total Revenue (paid orders only)
    const revenueResult = await prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true }
    })
    const totalRevenue = revenueResult._sum.total || 0

    // 2. Total Orders
    const totalOrders = await prisma.order.count()

    // 3. Total Products
    const totalProducts = await prisma.product.count()

    // 4. Total Users
    const totalUsers = await prisma.user.count()

    // 5. Recent Orders (last 10)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // 6. Top Products (by revenue)
    const topProductsData = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { paymentStatus: 'PAID' }
      },
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          price: 'desc'
        }
      },
      take: 5
    })

    // Fetch product details for top products
    const topProducts = await Promise.all(
      topProductsData.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, slug: true }
        })

        return {
          id: item.productId,
          name: product?.name || 'Produit supprimé',
          slug: product?.slug || '',
          totalSales: item._sum.quantity || 0,
          revenue: item._sum.price || 0
        }
      })
    )

    // 7. Monthly Revenue (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: sixMonthsAgo }
      },
      select: {
        createdAt: true,
        total: true
      }
    })

    // Group by month
    const monthlyRevenueMap = new Map<string, number>()

    monthlyOrders.forEach((order) => {
      const monthKey = new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'short'
      }).format(order.createdAt)

      const currentRevenue = monthlyRevenueMap.get(monthKey) || 0
      monthlyRevenueMap.set(monthKey, currentRevenue + order.total)
    })

    const monthlyRevenue = Array.from(monthlyRevenueMap.entries()).map(
      ([month, revenue]) => ({ month, revenue })
    )

    const stats: DashboardStats = {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      topProducts,
      monthlyRevenue
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { success: false, error: 'Erreur lors de la récupération des statistiques' }
  }
}
