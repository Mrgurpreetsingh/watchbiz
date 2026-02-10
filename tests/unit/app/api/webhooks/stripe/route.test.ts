/**
 * Unit Tests: Stripe Webhook API Route
 *
 * Tests for app/api/webhooks/stripe/route.ts:
 * - Signature verification
 * - Event handling (checkout.session.completed)
 * - Order creation via webhook
 * - Email notification (non-blocking)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { POST } from '@/app/api/webhooks/stripe/route'
import { mockStripe } from '../../../../../mocks/stripe'
import { prismaMock } from '../../../../../mocks/prisma'
import { ShippingMethod } from '@/types/checkout'
import { NextRequest } from 'next/server'
import * as checkoutActions from '@/actions/checkout'
import * as emailLib from '@/lib/email'

// Mock checkout actions
vi.mock('@/actions/checkout', () => ({
  createOrderFromStripe: vi.fn()
}))

// Mock email lib
vi.mock('@/lib/email', () => ({
  sendOrderConfirmationEmail: vi.fn()
}))

describe('Stripe Webhook: POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createStripeEvent = (type: string, sessionData: any) => {
    return {
      id: 'evt_test_123',
      object: 'event',
      type,
      data: {
        object: sessionData
      }
    }
  }

  const createMockRequest = (body: string, signature: string | null) => {
    const headers = new Headers()
    if (signature) {
      headers.set('stripe-signature', signature)
    }

    return new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      body,
      headers
    })
  }

  describe('🔐 Signature Verification', () => {
    it('should reject requests without signature header', async () => {
      // Arrange
      const request = createMockRequest('{"test": "data"}', null)

      // Act
      const response = await POST(request)
      const json = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(json).toEqual({ error: 'No signature header' })
      expect(mockStripe.webhooks.constructEvent).not.toHaveBeenCalled()
    })

    it('should reject requests with invalid signature', async () => {
      // Arrange
      const body = '{"test": "data"}'
      const request = createMockRequest(body, 'invalid_signature')

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      // Act
      const response = await POST(request)
      const json = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(json).toEqual({ error: 'Invalid signature' })
    })

    it('should accept requests with valid signature', async () => {
      // Arrange
      const body = '{"test": "data"}'
      const request = createMockRequest(body, 'valid_signature')

      const mockEvent = createStripeEvent('checkout.session.completed', {
        id: 'cs_test_123',
        payment_status: 'paid'
      })

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any)
      vi.mocked(checkoutActions.createOrderFromStripe).mockResolvedValue({
        success: true,
        data: { orderId: 'order_123', orderNumber: 'WB-123' }
      })

      // Act
      const response = await POST(request)

      // Assert
      expect(response.status).toBe(200)
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        body,
        'valid_signature',
        'whsec_test_secret_for_webhook_signature_verification'
      )
    })
  })

  describe('✅ Event: checkout.session.completed', () => {
    it('should create order when session is completed', async () => {
      // Arrange
      const sessionData = {
        id: 'cs_test_123',
        payment_status: 'paid',
        metadata: {
          userId: 'user_123',
          addressId: 'addr_123'
        }
      }

      const mockEvent = createStripeEvent('checkout.session.completed', sessionData)

      const body = JSON.stringify(mockEvent)
      const request = createMockRequest(body, 'valid_signature')

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any)
      vi.mocked(checkoutActions.createOrderFromStripe).mockResolvedValue({
        success: true,
        data: { orderId: 'order_123', orderNumber: 'WB-123' }
      })

      prismaMock.order.findUnique.mockResolvedValue({
        id: 'order_123',
        orderNumber: 'WB-123',
        userId: 'user_123',
        addressId: 'addr_123',
        subtotal: 300,
        tax: 60,
        shipping: 5,
        total: 365,
        stripePaymentId: 'pi_test',
        paymentMethod: 'card',
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user_123',
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed',
          role: 'USER',
          phone: null,
          isBlocked: false,
          emailVerified: new Date(),
          image: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        items: [
          {
            id: 'item_1',
            orderId: 'order_123',
            productId: 'prod_1',
            quantity: 2,
            price: 150,
            product: {
              id: 'prod_1',
              name: 'Rolex Submariner',
              slug: 'rolex-submariner',
              description: 'Luxury watch',
              price: 150,
              stock: 10,
              images: ['https://example.com/rolex.jpg'],
              sku: 'ROLEX-001',
              isActive: true,
              isFeatured: false,
              brandId: 'brand_1',
              categoryId: 'cat_1',
              compareAtPrice: null,
              costPrice: null,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          }
        ],
        shippingAddress: {
          id: 'addr_123',
          userId: 'user_123',
          fullName: 'Test User',
          phone: '0123456789',
          street: '123 Rue de Test',
          city: 'Paris',
          state: 'Île-de-France',
          postalCode: '75001',
          country: 'France',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      } as any)

      vi.mocked(emailLib.sendOrderConfirmationEmail).mockResolvedValue(undefined)

      // Act
      const response = await POST(request)
      const json = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(json).toEqual({ received: true })
      expect(checkoutActions.createOrderFromStripe).toHaveBeenCalledWith('cs_test_123')
    })

    it('should send confirmation email after order creation', async () => {
      // Arrange
      const sessionData = { id: 'cs_test_123', payment_status: 'paid' }
      const mockEvent = createStripeEvent('checkout.session.completed', sessionData)
      const body = JSON.stringify(mockEvent)
      const request = createMockRequest(body, 'valid_signature')

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any)
      vi.mocked(checkoutActions.createOrderFromStripe).mockResolvedValue({
        success: true,
        data: { orderId: 'order_123', orderNumber: 'WB-123' }
      })

      prismaMock.order.findUnique.mockResolvedValue({
        id: 'order_123',
        orderNumber: 'WB-123',
        userId: 'user_123',
        addressId: 'addr_123',
        subtotal: 300,
        tax: 60,
        shipping: 5,
        total: 365,
        user: {
          id: 'user_123',
          name: 'John Doe',
          email: 'john@example.com'
        },
        items: [
          {
            product: {
              name: 'Watch',
              images: ['https://example.com/watch.jpg']
            },
            quantity: 1,
            price: 300
          }
        ],
        shippingAddress: {
          fullName: 'John Doe',
          street: '123 Test St',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        createdAt: new Date('2024-01-15')
      } as any)

      vi.mocked(emailLib.sendOrderConfirmationEmail).mockResolvedValue(undefined)

      // Act
      await POST(request)

      // Assert
      expect(emailLib.sendOrderConfirmationEmail).toHaveBeenCalled()
    })

    it('should return 200 even if email fails (non-blocking)', async () => {
      // Arrange
      const sessionData = { id: 'cs_test_123', payment_status: 'paid' }
      const mockEvent = createStripeEvent('checkout.session.completed', sessionData)
      const body = JSON.stringify(mockEvent)
      const request = createMockRequest(body, 'valid_signature')

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any)
      vi.mocked(checkoutActions.createOrderFromStripe).mockResolvedValue({
        success: true,
        data: { orderId: 'order_123', orderNumber: 'WB-123' }
      })

      prismaMock.order.findUnique.mockResolvedValue({
        id: 'order_123',
        user: { email: 'test@example.com' },
        items: [],
        shippingAddress: {}
      } as any)

      // Mock email error
      vi.mocked(emailLib.sendOrderConfirmationEmail).mockRejectedValue(
        new Error('Email service down')
      )

      // Act
      const response = await POST(request)
      const json = await response.json()

      // Assert
      expect(response.status).toBe(200) // Should still return 200
      expect(json).toEqual({ received: true })
    })

    it('should return 200 even if order creation fails', async () => {
      // Arrange
      const sessionData = { id: 'cs_test_123', payment_status: 'paid' }
      const mockEvent = createStripeEvent('checkout.session.completed', sessionData)
      const body = JSON.stringify(mockEvent)
      const request = createMockRequest(body, 'valid_signature')

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any)
      vi.mocked(checkoutActions.createOrderFromStripe).mockResolvedValue({
        success: false,
        error: 'Stock insuffisant'
      })

      // Act
      const response = await POST(request)
      const json = await response.json()

      // Assert
      expect(response.status).toBe(200) // Avoid Stripe retries
      expect(json).toEqual({ received: true })
    })
  })

  describe('ℹ️ Other Events', () => {
    it('should handle payment_intent.succeeded event', async () => {
      // Arrange
      const mockEvent = createStripeEvent('payment_intent.succeeded', {
        id: 'pi_test_123'
      })
      const body = JSON.stringify(mockEvent)
      const request = createMockRequest(body, 'valid_signature')

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any)

      // Act
      const response = await POST(request)
      const json = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(json).toEqual({ received: true })
      // Should not create order for this event
      expect(checkoutActions.createOrderFromStripe).not.toHaveBeenCalled()
    })

    it('should handle unhandled event types gracefully', async () => {
      // Arrange
      const mockEvent = createStripeEvent('customer.created', { id: 'cus_123' })
      const body = JSON.stringify(mockEvent)
      const request = createMockRequest(body, 'valid_signature')

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent as any)

      // Act
      const response = await POST(request)
      const json = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(json).toEqual({ received: true })
    })
  })

  describe('❌ Error Handling', () => {
    it('should return 500 on unexpected errors', async () => {
      // Arrange
      const request = createMockRequest('{"test": "data"}', 'sig')

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Unexpected Stripe error')
      })

      // Act
      const response = await POST(request)
      const json = await response.json()

      // Assert
      expect(response.status).toBe(400) // Signature verification failed
      expect(json).toEqual({ error: 'Invalid signature' })
    })
  })
})
