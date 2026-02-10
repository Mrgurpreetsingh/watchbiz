/**
 * Unit Tests: Authentication Server Actions
 *
 * Tests for registerUser() in actions/auth.ts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerUser } from '@/actions/auth'
import { prismaMock } from '../../mocks/prisma'
import { createFormData } from '../../utils/server-action-helpers'
import * as bcryptjs from 'bcryptjs'

// Mock bcryptjs
vi.mock('bcryptjs', () => ({
  hash: vi.fn()
}))

describe('Authentication: registerUser()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('✅ Success Cases', () => {
    it('should create a new user with valid data', async () => {
      // Arrange
      const formData = createFormData({
        name: 'Test User',
        email: 'test@watchbiz.com',
        password: 'SecurePass123!'
      })

      const hashedPassword = '$2a$12$hashedPasswordMock'

      // Mock Prisma: no existing user
      prismaMock.user.findUnique.mockResolvedValue(null)

      // Mock bcrypt hash
      vi.mocked(bcryptjs.hash).mockResolvedValue(hashedPassword as never)

      // Mock Prisma: user creation
      prismaMock.user.create.mockResolvedValue({
        id: 'user_new_123',
        name: 'Test User',
        email: 'test@watchbiz.com',
        password: hashedPassword,
        role: 'USER',
        phone: null,
        isBlocked: false,
        emailVerified: null,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Act
      const result = await registerUser(formData)

      // Assert
      expect(result).toEqual({ success: true })
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@watchbiz.com' }
      })
      expect(bcryptjs.hash).toHaveBeenCalledWith('SecurePass123!', 12)
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Test User',
          email: 'test@watchbiz.com',
          password: hashedPassword,
          role: 'USER'
        }
      })
    })

    it('should hash password with bcrypt using 12 rounds', async () => {
      // Arrange
      const formData = createFormData({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'MyPassword123'
      })

      prismaMock.user.findUnique.mockResolvedValue(null)
      vi.mocked(bcryptjs.hash).mockResolvedValue('$2a$12$hashedMock' as never)
      prismaMock.user.create.mockResolvedValue({} as any)

      // Act
      await registerUser(formData)

      // Assert
      expect(bcryptjs.hash).toHaveBeenCalledWith('MyPassword123', 12)
    })

    it('should assign USER role by default', async () => {
      // Arrange
      const formData = createFormData({
        name: 'New User',
        email: 'newuser@test.com',
        password: 'password123'
      })

      prismaMock.user.findUnique.mockResolvedValue(null)
      vi.mocked(bcryptjs.hash).mockResolvedValue('$hashed' as never)
      prismaMock.user.create.mockResolvedValue({} as any)

      // Act
      await registerUser(formData)

      // Assert
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'USER'
        })
      })
    })
  })

  describe('❌ Validation Errors', () => {
    it('should reject short name (< 2 characters)', async () => {
      // Arrange
      const formData = createFormData({
        name: 'A',
        email: 'test@example.com',
        password: 'password123'
      })

      // Act
      const result = await registerUser(formData)

      // Assert
      expect(result).toEqual({
        error: 'Le nom doit contenir au moins 2 caractères'
      })
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
    })

    it('should reject invalid email format', async () => {
      // Arrange
      const formData = createFormData({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      })

      // Act
      const result = await registerUser(formData)

      // Assert
      expect(result).toEqual({
        error: 'Email invalide'
      })
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
    })

    it('should reject short password (< 8 characters)', async () => {
      // Arrange
      const formData = createFormData({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short'
      })

      // Act
      const result = await registerUser(formData)

      // Assert
      expect(result).toEqual({
        error: 'Le mot de passe doit contenir au moins 8 caractères'
      })
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
    })
  })

  describe('❌ Duplicate Email', () => {
    it('should reject registration with existing email', async () => {
      // Arrange
      const formData = createFormData({
        name: 'Another User',
        email: 'existing@watchbiz.com',
        password: 'password123'
      })

      // Mock existing user
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user_existing_123',
        email: 'existing@watchbiz.com',
        name: 'Existing User',
        password: '$2a$12$hashedPassword',
        role: 'USER',
        phone: null,
        isBlocked: false,
        emailVerified: new Date(),
        image: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      // Act
      const result = await registerUser(formData)

      // Assert
      expect(result).toEqual({
        error: 'Cet email est déjà utilisé'
      })
      expect(prismaMock.user.create).not.toHaveBeenCalled()
    })
  })

  describe('❌ Database Errors', () => {
    it('should handle Prisma errors gracefully', async () => {
      // Arrange
      const formData = createFormData({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })

      // Mock Prisma error
      prismaMock.user.findUnique.mockRejectedValue(
        new Error('Database connection failed')
      )

      // Act
      const result = await registerUser(formData)

      // Assert
      expect(result).toEqual({
        error: 'Une erreur est survenue. Veuillez réessayer.'
      })
    })

    it('should handle bcrypt errors gracefully', async () => {
      // Arrange
      const formData = createFormData({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })

      prismaMock.user.findUnique.mockResolvedValue(null)

      // Mock bcrypt error
      vi.mocked(bcryptjs.hash).mockRejectedValue(
        new Error('Bcrypt hash failed') as never
      )

      // Act
      const result = await registerUser(formData)

      // Assert
      expect(result).toEqual({
        error: 'Une erreur est survenue. Veuillez réessayer.'
      })
    })
  })
})
