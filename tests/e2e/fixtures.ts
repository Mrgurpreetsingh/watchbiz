/**
 * Playwright Test Fixtures
 *
 * Custom fixtures for E2E tests:
 * - Authenticated user context
 * - Admin user context
 * - Test data helpers
 * - Database utilities
 */

import { test as base, Page } from '@playwright/test'

// Extend basic test with custom fixtures
type CustomFixtures = {
  /**
   * Authenticated regular user page
   * Pre-authenticated with USER role
   */
  authenticatedPage: Page

  /**
   * Authenticated admin user page
   * Pre-authenticated with ADMIN role
   */
  adminPage: Page
}

export const test = base.extend<CustomFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // This will use the storage state from auth.setup.ts
    await use(page)
  },

  adminPage: async ({ browser }, use) => {
    // Create new context with admin auth state
    const context = await browser.newContext({
      storageState: 'tests/e2e/.auth/admin.json'
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  }
})

export { expect } from '@playwright/test'

/**
 * Test data helpers
 */
export const testData = {
  /**
   * Generate unique email for testing
   */
  uniqueEmail: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@watchbiz.test`,

  /**
   * Generate unique username
   */
  uniqueUsername: () => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Generate unique product slug
   */
  uniqueSlug: () => `watch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Valid test credentials
   */
  validUser: {
    name: 'Test User E2E',
    email: 'e2e-user@watchbiz.test',
    password: 'SecurePassword123!',
  },

  /**
   * Valid admin credentials
   */
  validAdmin: {
    name: 'Test Admin E2E',
    email: 'e2e-admin@watchbiz.test',
    password: 'AdminPassword123!',
  },

  /**
   * Test address
   */
  validAddress: {
    fullName: 'John Doe',
    phone: '0612345678',
    street: '123 Test Street',
    city: 'Paris',
    state: 'Île-de-France',
    postalCode: '75001',
    country: 'France',
  },

  /**
   * Test product
   */
  validProduct: {
    name: 'Rolex Submariner Test',
    slug: 'rolex-submariner-test',
    description: 'A beautiful luxury diving watch with exquisite craftsmanship and precision',
    price: 8500,
    stock: 5,
    isFeatured: false,
    isActive: true,
  }
}
