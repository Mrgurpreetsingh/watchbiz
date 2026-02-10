/**
 * Stripe SDK Mock
 *
 * Mocks the Stripe client to avoid real API calls in tests.
 * Provides mocked methods for checkout sessions and webhook signature verification.
 */

import { vi } from 'vitest'

export const mockStripe = {
  checkout: {
    sessions: {
      create: vi.fn(),
      retrieve: vi.fn(),
      list: vi.fn(),
    }
  },
  webhooks: {
    constructEvent: vi.fn()
  },
  paymentIntents: {
    retrieve: vi.fn(),
    list: vi.fn(),
  }
}

// Mock the Stripe client export
vi.mock('@/lib/stripe', () => ({
  stripe: mockStripe,
  STRIPE_WEBHOOK_SECRET: 'whsec_test_secret_for_webhook_signature_verification'
}))

export default mockStripe
