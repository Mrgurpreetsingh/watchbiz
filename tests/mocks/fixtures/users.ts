/**
 * Test User Fixtures
 *
 * Pre-defined user data for consistent testing across the test suite.
 */

export const testUsers = {
  /**
   * Regular USER role account
   */
  regularUser: {
    id: 'user_regular_123',
    email: 'user@watchbiz.com',
    name: 'Test User',
    role: 'USER' as const,
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYnK7u/e.q6', // "password123"
    phone: null,
    isBlocked: false,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    emailVerified: new Date('2024-01-01T00:00:00.000Z'),
    image: null
  },

  /**
   * ADMIN role account
   */
  adminUser: {
    id: 'user_admin_123',
    email: 'admin@watchbiz.com',
    name: 'Test Admin',
    role: 'ADMIN' as const,
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYnK7u/e.q6', // "password123"
    phone: '+33612345678',
    isBlocked: false,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    emailVerified: new Date('2024-01-01T00:00:00.000Z'),
    image: null
  },

  /**
   * Blocked user account (for testing blocked access)
   */
  blockedUser: {
    id: 'user_blocked_123',
    email: 'blocked@watchbiz.com',
    name: 'Blocked User',
    role: 'USER' as const,
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYnK7u/e.q6',
    phone: null,
    isBlocked: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    emailVerified: new Date('2024-01-01T00:00:00.000Z'),
    image: null
  },

  /**
   * User without email verification (for testing unverified access)
   */
  unverifiedUser: {
    id: 'user_unverified_123',
    email: 'unverified@watchbiz.com',
    name: 'Unverified User',
    role: 'USER' as const,
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYnK7u/e.q6',
    phone: null,
    isBlocked: false,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    emailVerified: null,
    image: null
  }
}

/**
 * Plain text passwords for test users (for login testing)
 */
export const testPasswords = {
  default: 'password123',
  strong: 'SecurePass123!',
  weak: 'weak'
}
