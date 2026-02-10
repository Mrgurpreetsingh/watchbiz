/**
 * Unit Tests: Order Server Actions
 *
 * Tests for actions/orders.ts:
 * - getOrderById() - Order ownership verification
 * - getUserOrders() - List user's orders
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getOrderById, getUserOrders } from '@/actions/orders'
import { prismaMock } from '../../mocks/prisma'
import { mockAuthenticatedUser, mockUnauthenticatedUser } from '../../utils/auth-helpers'
import { mockAuth } from '../../mocks/auth'
import { mockOrder } from '../../utils/db-helpers'

describe('Orders: getOrderById()', () => {
  const USER_ID = 'clwhzg8me000008l51prc3qna'
  const OTHER_USER_ID = 'clwhzg8me000108l51prc3qnb'
  const ORDER_ID = 'clwhzg8me000208l51prc3qnc'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('🔒 Authentication', () => {
    it('should reject unauthenticated users', async () => {
      // Arrange
      mockUnauthenticatedUser()

      // Act
      const result = await getOrderById(ORDER_ID)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Non authentifié'
      })
      expect(prismaMock.order.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('🛡️ Ownership Verification', () => {
    it('should allow user to view their own order', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = USER_ID
      mockAuth.mockResolvedValue(session)

      const order = mockOrder({
        id: ORDER_ID,
        userId: USER_ID,
        orderNumber: 'WB-123'
      })

      prismaMock.order.findUnique.mockResolvedValue(order as any)

      // Act
      const result = await getOrderById(ORDER_ID)

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(ORDER_ID)
      expect(result.data?.userId).toBe(USER_ID)
    })

    it('should prevent user from viewing other users orders', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = USER_ID
      mockAuth.mockResolvedValue(session)

      // Order belongs to different user
      const otherUserOrder = mockOrder({
        id: ORDER_ID,
        userId: OTHER_USER_ID,
        orderNumber: 'WB-456'
      })

      prismaMock.order.findUnique.mockResolvedValue(otherUserOrder as any)

      // Act
      const result = await getOrderById(ORDER_ID)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Accès non autorisé'
      })
    })
  })

  describe('❌ Order Not Found', () => {
    it('should return error if order does not exist', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.order.findUnique.mockResolvedValue(null)

      // Act
      const result = await getOrderById('clwhzg8me000308l51prc3qnd')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Commande introuvable'
      })
    })
  })

  describe('❌ Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.order.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const result = await getOrderById(ORDER_ID)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Erreur lors de la récupération de la commande'
      })
    })
  })
})

describe('Orders: getUserOrders()', () => {
  const USER_ID = 'clwhzg8me000008l51prc3qna'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('🔒 Authentication', () => {
    it('should reject unauthenticated users', async () => {
      // Arrange
      mockUnauthenticatedUser()

      // Act
      const result = await getUserOrders()

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Non authentifié'
      })
      expect(prismaMock.order.findMany).not.toHaveBeenCalled()
    })

    it('should return orders for authenticated user', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = USER_ID
      mockAuth.mockResolvedValue(session)

      const userOrders = [
        mockOrder({ id: 'order_1', userId: USER_ID, orderNumber: 'WB-123' }),
        mockOrder({ id: 'order_2', userId: USER_ID, orderNumber: 'WB-456' })
      ]

      prismaMock.order.findMany.mockResolvedValue(userOrders as any)

      // Act
      const result = await getUserOrders()

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(result.data![0].userId).toBe(USER_ID)
      expect(result.data![1].userId).toBe(USER_ID)

      // Verify correct query
      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
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
    })

    it('should return empty array if user has no orders', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.order.findMany.mockResolvedValue([])

      // Act
      const result = await getUserOrders()

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })
  })

  describe('❌ Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.order.findMany.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const result = await getUserOrders()

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Erreur lors de la récupération des commandes'
      })
    })
  })
})
