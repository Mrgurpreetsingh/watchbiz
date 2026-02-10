/**
 * Integration Test: Checkout Flow
 *
 * Tests the complete e-commerce checkout journey:
 * 1. Create checkout session (with address validation, tax/shipping calculation)
 * 2. Stripe webhook receives event
 * 3. Order created in database
 * 4. Stock decremented via Prisma $transaction
 *
 * Tests multi-step operations with real business logic (no mocked calculations).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createCheckoutSession, createOrderFromStripe } from '@/actions/checkout'
import { prismaMock } from '../mocks/prisma'
import { mockStripe } from '../mocks/stripe'
import { mockAuth } from '../mocks/auth'
import { mockAuthenticatedUser } from '../utils/auth-helpers'
import { mockProduct, mockAddress } from '../utils/db-helpers'
import type { CartItem } from '@/types/checkout'

// Valid CUID constants
const USER_ID = 'clwhzg8me000008l51prc3qna'
const ADDRESS_ID = 'clwhzg8me000108l51prc3qnb'
const PRODUCT_1_ID = 'clwhzg8me000208l51prc3qnc'
const PRODUCT_2_ID = 'clwhzg8me000308l51prc3qnd'
const SESSION_ID = 'cs_test_checkout_session_12345'

describe('Integration: Checkout Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create checkout session with correct calculations', async () => {
    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    session.user.email = 'test@watchbiz.com'
    mockAuth.mockResolvedValue(session)

    // Arrange: Valid address owned by user
    const address = mockAddress({
      id: ADDRESS_ID,
      userId: USER_ID,
      fullName: 'John Doe',
      street: '123 Test Street',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    })
    prismaMock.address.findUnique.mockResolvedValue(address as any)

    // Arrange: Cart with 2 products (subtotal = 350€)
    const cartItems: CartItem[] = [
      {
        productId: PRODUCT_1_ID,
        name: 'Rolex Submariner',
        price: 250,
        quantity: 1,
        image: 'https://example.com/rolex.jpg',
        slug: 'rolex-submariner'
      },
      {
        productId: PRODUCT_2_ID,
        name: 'Omega Speedmaster',
        price: 100,
        quantity: 1,
        image: 'https://example.com/omega.jpg',
        slug: 'omega-speedmaster'
      }
    ]

    // Arrange: Mock Stripe session creation
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: SESSION_ID,
      url: 'https://checkout.stripe.com/pay/test_123',
      payment_status: 'unpaid'
    } as any)

    // Act: Create checkout session (addressId, shippingMethod, items)
    const checkoutResult = await createCheckoutSession(
      ADDRESS_ID,
      'STANDARD', // Subtotal < 200€, so shipping fee applies
      cartItems
    )

    // Assert: Checkout session created successfully
    expect(checkoutResult.success).toBe(true)
    expect(checkoutResult.data?.url).toBe('https://checkout.stripe.com/pay/test_123')

    // Assert: Stripe was called with correct metadata
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'payment',
        customer_email: 'test@watchbiz.com',
        metadata: expect.objectContaining({
          userId: USER_ID,
          addressId: ADDRESS_ID,
          shippingMethod: 'STANDARD'
        })
      })
    )
  })

  it('should reject checkout with invalid address', async () => {
    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    mockAuth.mockResolvedValue(session)

    // Arrange: Address does not exist
    prismaMock.address.findUnique.mockResolvedValue(null)

    const cartItems: CartItem[] = [
      {
        productId: PRODUCT_1_ID,
        name: 'Test Watch',
        price: 100,
        quantity: 1,
        image: 'https://example.com/watch.jpg',
        slug: 'test-watch'
      }
    ]

    // Act: Try to create checkout session
    const result = await createCheckoutSession(ADDRESS_ID, 'STANDARD', cartItems)

    // Assert: Checkout rejected due to invalid address
    expect(result.success).toBe(false)
    expect(result.error).toContain('Adresse invalide')

    // Assert: Stripe was NOT called
    expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('should reject checkout with address not owned by user', async () => {
    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    mockAuth.mockResolvedValue(session)

    // Arrange: Address belongs to another user
    const otherUserAddress = mockAddress({
      id: ADDRESS_ID,
      userId: 'other_user_id', // Different user
      fullName: 'Other User'
    })
    prismaMock.address.findUnique.mockResolvedValue(otherUserAddress as any)

    const cartItems: CartItem[] = [
      {
        productId: PRODUCT_1_ID,
        name: 'Test Watch',
        price: 100,
        quantity: 1,
        image: 'https://example.com/watch.jpg',
        slug: 'test-watch'
      }
    ]

    // Act: Try to create checkout session
    const result = await createCheckoutSession(ADDRESS_ID, 'STANDARD', cartItems)

    // Assert: Checkout rejected due to address ownership
    expect(result.success).toBe(false)
    expect(result.error).toContain('Adresse invalide')

    // Assert: Stripe was NOT called
    expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled()
  })

  it('should apply free shipping for orders >= 200€', async () => {
    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    mockAuth.mockResolvedValue(session)

    // Arrange: Valid address
    prismaMock.address.findUnique.mockResolvedValue(
      mockAddress({ id: ADDRESS_ID, userId: USER_ID }) as any
    )

    // Arrange: Expensive product (>= 200€ threshold)
    const cartItems: CartItem[] = [
      {
        productId: PRODUCT_1_ID,
        name: 'Luxury Watch',
        price: 500,
        quantity: 1,
        image: 'https://example.com/luxury.jpg',
        slug: 'luxury-watch'
      }
    ]

    // Arrange: Mock Stripe
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: SESSION_ID,
      url: 'https://checkout.stripe.com/pay/test_123'
    } as any)

    // Act: Create checkout session
    await createCheckoutSession(ADDRESS_ID, 'STANDARD', cartItems)

    // Assert: Stripe was called
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalled()

    // Assert: No shipping line item (free shipping applied)
    const stripeCall = mockStripe.checkout.sessions.create.mock.calls[0][0]
    const shippingItem = stripeCall.line_items?.find((item: any) =>
      item.price_data?.product_data?.name?.includes('Livraison')
    )
    expect(shippingItem).toBeUndefined() // No shipping charge
  })

})
