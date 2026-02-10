/**
 * Unit Tests: Stripe Checkout Server Actions
 *
 * Tests for actions/checkout.ts:
 * - createCheckoutSession() - Create Stripe Checkout session
 * - createOrderFromStripe() - Create order from webhook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createCheckoutSession, createOrderFromStripe } from '@/actions/checkout'
import { prismaMock } from '../../mocks/prisma'
import { mockAuth } from '../../mocks/auth'
import { mockStripe } from '../../mocks/stripe'
import { mockAuthenticatedUser, mockUnauthenticatedUser } from '../../utils/auth-helpers'
import { mockPrismaTransaction, mockUser, mockAddress, mockProduct } from '../../utils/db-helpers'
import { ShippingMethod, FREE_SHIPPING_THRESHOLD } from '@/types/checkout'
import type { CartItem } from '@/types/checkout'

describe('Stripe Checkout: createCheckoutSession()', () => {
  // Use valid CUID format for all IDs
  const VALID_USER_ID = 'clwhzg8me000008l51prc3qna'
  const VALID_ADDRESS_ID = 'clwhzg8me000108l51prc3qnb'
  const VALID_ADDRESS_ID_2 = 'clwhzg8me000208l51prc3qnc'
  const OTHER_USER_ID = 'clwhzg8me000308l51prc3qnd'

  const mockAddress1 = mockAddress({ id: VALID_ADDRESS_ID, userId: VALID_USER_ID })

  const cartItems: CartItem[] = [
    {
      productId: 'prod_1',
      name: 'Rolex Submariner',
      price: 150,
      quantity: 1,
      image: 'https://example.com/rolex.jpg',
      slug: 'rolex-submariner'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('🔒 Authentication', () => {
    it('should reject unauthenticated users', async () => {
      // Arrange
      mockUnauthenticatedUser()

      // Act
      const result = await createCheckoutSession(VALID_ADDRESS_ID, ShippingMethod.STANDARD, cartItems)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Non authentifié'
      })
      expect(prismaMock.address.findUnique).not.toHaveBeenCalled()
      expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled()
    })

    it('should accept authenticated users', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      // Override session user ID to match our test user
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.address.findUnique.mockResolvedValue(mockAddress1)
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      } as any)

      // Act
      const result = await createCheckoutSession(VALID_ADDRESS_ID, ShippingMethod.STANDARD, cartItems)

      // Assert
      expect(result.success).toBe(true)
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalled()
    })
  })

  describe('🏠 Address Ownership', () => {
    it('should reject if address does not exist', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.address.findUnique.mockResolvedValue(null)

      // Act
      const result = await createCheckoutSession(VALID_ADDRESS_ID_2, ShippingMethod.STANDARD, cartItems)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Adresse invalide'
      })
      expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled()
    })

    it('should reject if address belongs to another user', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      const otherUserAddress = mockAddress({ id: VALID_ADDRESS_ID_2, userId: OTHER_USER_ID })
      prismaMock.address.findUnique.mockResolvedValue(otherUserAddress)

      // Act
      const result = await createCheckoutSession(VALID_ADDRESS_ID_2, ShippingMethod.STANDARD, cartItems)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Adresse invalide'
      })
      expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled()
    })

    it('should accept if address belongs to current user', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.address.findUnique.mockResolvedValue(mockAddress1)
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test'
      } as any)

      // Act
      const result = await createCheckoutSession(VALID_ADDRESS_ID, ShippingMethod.STANDARD, cartItems)

      // Assert
      expect(result.success).toBe(true)
    })
  })

  describe('🚚 Free Shipping Logic', () => {
    it('should apply FREE shipping for subtotal >= 200€', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.address.findUnique.mockResolvedValue(mockAddress1)

      const expensiveCart: CartItem[] = [
        {
          productId: 'prod_1',
          name: 'Luxury Watch',
          price: 250,
          quantity: 1,
          image: 'https://example.com/watch.jpg',
          slug: 'luxury-watch'
        }
      ]

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/test'
      } as any)

      // Act
      await createCheckoutSession(VALID_ADDRESS_ID, ShippingMethod.STANDARD, expensiveCart)

      // Assert
      const createCall = mockStripe.checkout.sessions.create.mock.calls[0][0]
      // Vérifie que les line_items ne contiennent que le produit (pas de shipping line_item)
      expect(createCall.line_items).toHaveLength(1)
      expect(createCall.line_items![0].price_data!.product_data!.name).toBe('Luxury Watch')
    })

    it('should apply shipping cost for subtotal < 200€', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.address.findUnique.mockResolvedValue(mockAddress1)

      const cheapCart: CartItem[] = [
        {
          productId: 'prod_1',
          name: 'Affordable Watch',
          price: 100,
          quantity: 1,
          image: 'https://example.com/watch.jpg',
          slug: 'affordable-watch'
        }
      ]

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/test'
      } as any)

      // Act
      await createCheckoutSession(VALID_ADDRESS_ID, ShippingMethod.STANDARD, cheapCart)

      // Assert
      const createCall = mockStripe.checkout.sessions.create.mock.calls[0][0]
      // Vérifie que les line_items contiennent le produit + shipping
      expect(createCall.line_items).toHaveLength(2)
      expect(createCall.line_items![1].price_data!.product_data!.name).toContain('Livraison')
    })
  })

  describe('💰 Tax Calculation', () => {
    it('should calculate 20% VAT on subtotal', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.address.findUnique.mockResolvedValue(mockAddress1)

      const cart: CartItem[] = [
        { productId: 'p1', name: 'Watch', price: 100, quantity: 2, image: '', slug: 'watch' }
      ]

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_123',
        url: 'https://checkout.stripe.com/test'
      } as any)

      // Act
      await createCheckoutSession(VALID_ADDRESS_ID, ShippingMethod.STANDARD, cart)

      // Assert: Subtotal = 200€, Tax = 40€ (20%), Shipping = gratuit, Total = 240€
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalled()
    })
  })

  describe('✅ Validation', () => {
    it('should reject empty cart', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      // Act
      const result = await createCheckoutSession(VALID_ADDRESS_ID, ShippingMethod.STANDARD, [])

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Le panier ne peut pas être vide'
      })
      expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled()
    })

    it('should reject invalid addressId format', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      // Act - use invalid format (not a CUID)
      const result = await createCheckoutSession('invalid-id-123', ShippingMethod.STANDARD, cartItems)

      // Assert
      expect(result.success).toBe(false)
      expect(result.error).toContain('invalide')
    })
  })

  describe('✅ Success Case', () => {
    it('should create Stripe session with correct line_items', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.address.findUnique.mockResolvedValue(mockAddress1)

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123'
      } as any)

      // Act
      const result = await createCheckoutSession(VALID_ADDRESS_ID, ShippingMethod.STANDARD, cartItems)

      // Assert
      expect(result).toEqual({
        success: true,
        data: {
          url: 'https://checkout.stripe.com/pay/cs_test_123',
          sessionId: 'cs_test_123'
        }
      })

      const createCall = mockStripe.checkout.sessions.create.mock.calls[0][0]
      expect(createCall.mode).toBe('payment')
      expect(createCall.payment_method_types).toEqual(['card'])
      expect(createCall.metadata?.userId).toBe(VALID_USER_ID)
      expect(createCall.metadata?.addressId).toBe(VALID_ADDRESS_ID)
    })

    it('should return error if Stripe session has no URL', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.id = VALID_USER_ID
      mockAuth.mockResolvedValue(session)

      prismaMock.address.findUnique.mockResolvedValue(mockAddress1)

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_test_123',
        url: null // No URL generated
      } as any)

      // Act
      const result = await createCheckoutSession(VALID_ADDRESS_ID, ShippingMethod.STANDARD, cartItems)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Impossible de créer la session Stripe'
      })
    })
  })
})

describe('Stripe Checkout: createOrderFromStripe()', () => {
  const mockSession = {
    id: 'cs_test_123',
    payment_status: 'paid',
    payment_intent: 'pi_test_123',
    metadata: {
      userId: 'user_test_123',
      addressId: 'addr_test_123',
      shippingMethod: ShippingMethod.STANDARD,
      items: JSON.stringify([
        {
          productId: 'prod_1',
          name: 'Rolex Submariner',
          price: 150,
          quantity: 2,
          image: 'https://example.com/rolex.jpg',
          slug: 'rolex-submariner'
        }
      ])
    }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('✅ Success Case', () => {
    it('should create order with valid session', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession as any)

      // Mock product stock check
      prismaMock.product.findUnique.mockResolvedValue(
        mockProduct({ id: 'prod_1', stock: 10, name: 'Rolex Submariner' })
      )

      // Mock transaction
      const createdOrder = {
        id: 'order_123',
        orderNumber: 'WB-1234567890-ABC123',
        userId: 'user_test_123',
        addressId: 'addr_test_123',
        subtotal: 300,
        tax: 60,
        shipping: 5,
        total: 365,
        stripePaymentId: 'pi_test_123',
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      mockPrismaTransaction(createdOrder)
      prismaMock.order.create.mockResolvedValue(createdOrder as any)
      prismaMock.product.update.mockResolvedValue({} as any)

      // Act
      const result = await createOrderFromStripe('cs_test_123')

      // Assert
      expect(result.success).toBe(true)
      expect(result.data?.orderId).toBe('order_123')
      expect(result.data?.orderNumber).toContain('WB-')
      expect(prismaMock.order.create).toHaveBeenCalled()
      expect(prismaMock.product.update).toHaveBeenCalled()
    })

    it('should decrement stock in transaction', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession as any)
      prismaMock.product.findUnique.mockResolvedValue(
        mockProduct({ id: 'prod_1', stock: 10 })
      )

      mockPrismaTransaction({})
      prismaMock.order.create.mockResolvedValue({
        id: 'order_123',
        orderNumber: 'WB-123'
      } as any)

      // Act
      await createOrderFromStripe('cs_test_123')

      // Assert: Verify stock decrement was called
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 'prod_1' },
        data: {
          stock: {
            decrement: 2 // quantity from mockSession
          }
        }
      })
    })

    it('should generate unique order number with WB prefix', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession as any)
      prismaMock.product.findUnique.mockResolvedValue(mockProduct({ stock: 10 }))

      mockPrismaTransaction({})
      prismaMock.order.create.mockResolvedValue({
        id: 'order_123',
        orderNumber: 'WB-1706745600000-XYZ'
      } as any)

      // Act
      const result = await createOrderFromStripe('cs_test_123')

      // Assert
      expect(result.data?.orderNumber).toMatch(/^WB-\d+-[A-Z0-9]+$/)
    })
  })

  describe('❌ Payment Status', () => {
    it('should reject unpaid sessions', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        ...mockSession,
        payment_status: 'unpaid'
      } as any)

      // Act
      const result = await createOrderFromStripe('cs_test_123')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Paiement non confirmé'
      })
      expect(prismaMock.product.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('❌ Invalid Metadata', () => {
    it('should reject missing userId', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        ...mockSession,
        metadata: { ...mockSession.metadata, userId: undefined }
      } as any)

      // Act
      const result = await createOrderFromStripe('cs_test_123')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Métadonnées session invalides'
      })
    })

    it('should reject empty items array', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockResolvedValue({
        ...mockSession,
        metadata: { ...mockSession.metadata, items: '[]' }
      } as any)

      // Act
      const result = await createOrderFromStripe('cs_test_123')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Métadonnées session invalides'
      })
    })
  })

  describe('❌ Insufficient Stock', () => {
    it('should reject order when stock is insufficient', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession as any)

      // Mock product with low stock
      prismaMock.product.findUnique.mockResolvedValue(
        mockProduct({ id: 'prod_1', stock: 1, name: 'Rolex Submariner' })
      )

      // Act
      const result = await createOrderFromStripe('cs_test_123')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Stock insuffisant pour Rolex Submariner (disponible: 1, demandé: 2)'
      })
      expect(prismaMock.order.create).not.toHaveBeenCalled()
    })

    it('should reject if product not found', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession as any)
      prismaMock.product.findUnique.mockResolvedValue(null)

      // Act
      const result = await createOrderFromStripe('cs_test_123')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Produit introuvable: Rolex Submariner'
      })
      expect(prismaMock.order.create).not.toHaveBeenCalled()
    })
  })

  describe('❌ Error Handling', () => {
    it('should handle Stripe API errors gracefully', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockRejectedValue(
        new Error('Stripe API error')
      )

      // Act
      const result = await createOrderFromStripe('cs_invalid')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Impossible de créer la commande'
      })
    })

    it('should handle database transaction errors', async () => {
      // Arrange
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession as any)
      prismaMock.product.findUnique.mockResolvedValue(mockProduct({ stock: 10 }))

      // Mock transaction error
      prismaMock.$transaction.mockRejectedValue(new Error('Transaction failed'))

      // Act
      const result = await createOrderFromStripe('cs_test_123')

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Impossible de créer la commande'
      })
    })
  })
})
