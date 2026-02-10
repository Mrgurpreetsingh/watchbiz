/**
 * Authentication Test Helpers
 *
 * Utilities for mocking authenticated/unauthenticated user sessions in tests.
 */

import type { Session } from 'next-auth'
import { mockAuth } from '../mocks/auth'

/**
 * Mock an authenticated user session with specified role
 *
 * @param role - User role (USER or ADMIN)
 * @returns The mocked session object
 *
 * @example
 * ```typescript
 * mockAuthenticatedUser('ADMIN')
 * // Now auth() will return an admin session
 * ```
 */
export const mockAuthenticatedUser = (role: 'USER' | 'ADMIN' = 'USER'): Session => {
  const session: Session = {
    user: {
      id: role === 'ADMIN' ? 'admin_test_123' : 'user_test_123',
      email: role === 'ADMIN' ? 'admin@watchbiz.com' : 'user@watchbiz.com',
      name: role === 'ADMIN' ? 'Test Admin' : 'Test User',
      role
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }

  mockAuth.mockResolvedValue(session)
  return session
}

/**
 * Mock an unauthenticated state (no session)
 *
 * @example
 * ```typescript
 * mockUnauthenticatedUser()
 * // Now auth() will return null
 * ```
 */
export const mockUnauthenticatedUser = (): void => {
  mockAuth.mockResolvedValue(null)
}

/**
 * Create a custom session object for advanced test scenarios
 *
 * @param overrides - Custom session properties
 * @returns The custom session object
 *
 * @example
 * ```typescript
 * const blockedUserSession = createCustomSession({
 *   user: { id: 'blocked_user_123', role: 'USER', name: 'Blocked User' }
 * })
 * mockAuth.mockResolvedValue(blockedUserSession)
 * ```
 */
export const createCustomSession = (overrides: Partial<Session> = {}): Session => {
  const defaultSession: Session = {
    user: {
      id: 'custom_user_123',
      email: 'custom@watchbiz.com',
      name: 'Custom User',
      role: 'USER'
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }

  return {
    ...defaultSession,
    ...overrides,
    user: {
      ...defaultSession.user,
      ...overrides.user
    }
  }
}
