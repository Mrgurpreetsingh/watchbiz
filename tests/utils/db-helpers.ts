/**
 * Database (Prisma) Test Helpers
 *
 * Utilities for working with mocked Prisma client in tests.
 */

import { mockReset } from 'vitest-mock-extended'
import { prismaMock } from '../mocks/prisma'

/**
 * Reset all Prisma mocks to their default state
 *
 * This is automatically called in beforeEach() but can be manually invoked if needed.
 *
 * @example
 * ```typescript
 * afterEach(() => {
 *   resetPrismaMocks()
 * })
 * ```
 */
export const resetPrismaMocks = (): void => {
  mockReset(prismaMock)
}

/**
 * Mock Prisma $transaction to execute callback immediately
 *
 * By default, Prisma.$transaction receives a callback that uses a transaction client.
 * This helper mocks it to execute the callback immediately with the main prismaMock.
 *
 * @param result - Optional result to return from the transaction
 * @returns The result passed in (or result from callback)
 *
 * @example
 * ```typescript
 * mockPrismaTransaction()
 * // Now $transaction will execute callbacks immediately
 *
 * // In the code being tested:
 * await prisma.$transaction(async (tx) => {
 *   await tx.product.update({ ... })
 *   await tx.order.create({ ... })
 * })
 * ```
 */
export const mockPrismaTransaction = <T>(result?: T) => {
  prismaMock.$transaction.mockImplementation(async (callback: any) => {
    if (typeof callback === 'function') {
      // Execute the callback with prismaMock as the transaction client
      return await callback(prismaMock)
    }
    // If callback is an array of promises, return the result
    return result as T
  })
}

/**
 * Create a mock user object with default test data
 *
 * @param overrides - Properties to override
 * @returns A mock user object matching Prisma User type
 *
 * @example
 * ```typescript
 * prismaMock.user.findUnique.mockResolvedValue(
 *   mockUser({ email: 'custom@example.com' })
 * )
 * ```
 */
export const mockUser = (overrides = {}) => {
  return {
    id: 'user_test_123',
    email: 'test@watchbiz.com',
    name: 'Test User',
    role: 'USER' as const,
    password: '$2a$12$hashedPasswordForTestUser',
    phone: null,
    isBlocked: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    emailVerified: new Date('2024-01-01'),
    image: null,
    ...overrides
  }
}

/**
 * Create a mock product object with default test data
 *
 * @param overrides - Properties to override
 * @returns A mock product object matching Prisma Product type
 */
export const mockProduct = (overrides = {}) => {
  return {
    id: 'product_test_123',
    name: 'Test Watch',
    slug: 'test-watch',
    description: 'A beautiful test watch for testing purposes',
    price: 1000,
    quantity: 10,
    images: ['https://example.com/watch.jpg'],
    sku: 'TEST-WATCH-001',
    isActive: true,
    isFeatured: false,
    brandId: 'brand_test_123',
    categoryId: 'category_test_123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  }
}

/**
 * Create a mock address object with default test data
 *
 * @param overrides - Properties to override
 * @returns A mock address object matching Prisma Address type
 */
export const mockAddress = (overrides = {}) => {
  return {
    id: 'address_test_123',
    userId: 'user_test_123',
    fullName: 'Test User',
    phone: '0123456789',
    street: '123 Rue de Test',
    city: 'Paris',
    state: 'Île-de-France',
    postalCode: '75001',
    country: 'France',
    isDefault: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  }
}

/**
 * Create a mock order object with default test data
 *
 * @param overrides - Properties to override
 * @returns A mock order object matching Prisma Order type
 */
export const mockOrder = (overrides = {}) => {
  return {
    id: 'order_test_123',
    orderNumber: 'ORD-2024-0001',
    userId: 'user_test_123',
    status: 'PENDING' as const,
    paymentStatus: 'PENDING' as const,
    subtotal: 1000,
    tax: 200,
    shipping: 5,
    total: 1205,
    stripePaymentId: 'pi_test_123',
    addressId: 'address_test_123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides
  }
}
