/**
 * Vitest Global Setup
 *
 * This file is executed once before all tests run.
 * It sets up global mocks and environment configuration.
 */

// Import global mocks (they auto-register via vi.mock())
import '../mocks/prisma'
import '../mocks/stripe'
import '../mocks/auth'

// Extend Vitest matchers if needed
import { expect } from 'vitest'

// Custom matchers can be added here
// Example: expect.extend({ toBeValidUUID: ... })

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_SECRET = 'test_secret_min_32_characters_long_string_for_jwt'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
