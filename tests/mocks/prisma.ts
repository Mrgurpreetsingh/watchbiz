/**
 * Prisma Mock Singleton
 *
 * Uses vitest-mock-extended to create a fully type-safe mock of PrismaClient.
 * This mock is automatically reset between tests via beforeEach().
 */

import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'
import { beforeEach } from 'vitest'

// Create a deep mock of PrismaClient with full type safety
export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

// Mock the default export of @/lib/prisma
vi.mock('@/lib/prisma', () => ({
  default: prismaMock
}))

// Reset all mocks before each test to ensure test isolation
beforeEach(() => {
  mockReset(prismaMock)
})
