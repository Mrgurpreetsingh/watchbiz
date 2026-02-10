/**
 * NextAuth Mock
 *
 * Mocks the NextAuth auth() function to simulate authenticated/unauthenticated states.
 * Use mockAuth.mockResolvedValue() in tests to set the session.
 */

import { vi } from 'vitest'
import type { Session } from 'next-auth'

// Create a mock function with proper typing
export const mockAuth = vi.fn<[], Promise<Session | null>>()

// Mock signIn and signOut as well (used in some actions)
export const mockSignIn = vi.fn()
export const mockSignOut = vi.fn()

// Mock the entire @/lib/auth module
vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
  signIn: mockSignIn,
  signOut: mockSignOut
}))

export default mockAuth
