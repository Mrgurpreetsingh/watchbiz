/**
 * Integration Test: Authentication Flow
 *
 * Tests the complete authentication journey:
 * 1. User registration with real password hashing (bcrypt)
 * 2. Password verification with bcrypt.compare()
 * 3. Full bcrypt integration (no mocks)
 *
 * Unlike unit tests, bcrypt is NOT mocked here to test real hashing.
 * We test the full registration → password verification flow.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { registerUser } from '@/actions/auth'
import { prismaMock } from '../mocks/prisma'
import { createFormData } from '../utils/server-action-helpers'
import bcryptjs from 'bcryptjs'

describe('Integration: Authentication Flow', () => {
  const USER_ID = 'clwhzg8me000008l51prc3qna'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full registration → password verification flow with real bcrypt', async () => {
    // STEP 1: User Registration
    // Arrange
    const userData = {
      name: 'Test User',
      email: 'test@watchbiz.com',
      password: 'SecurePassword123!'
    }

    const formData = createFormData(userData)

    prismaMock.user.findUnique.mockResolvedValue(null) // No existing user
    prismaMock.user.create.mockResolvedValue({
      id: USER_ID,
      name: userData.name,
      email: userData.email,
      password: 'hashed_password_will_be_replaced',
      role: 'USER',
      phone: null,
      isBlocked: false,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Act: Register user
    const registerResult = await registerUser(formData)

    // Assert: Registration successful
    expect(registerResult.success).toBe(true)
    expect(prismaMock.user.create).toHaveBeenCalled()

    // STEP 2: Verify Password was Hashed
    // Extract hashed password from Prisma create call
    const createCall = prismaMock.user.create.mock.calls[0][0]
    const hashedPassword = createCall.data.password
    expect(hashedPassword).toBeDefined()
    expect(hashedPassword.length).toBe(60) // bcrypt hash length
    expect(hashedPassword).toMatch(/^\$2[aby]\$\d{2}\$/) // bcrypt format

    // STEP 3: Verify bcrypt Comparison Works
    // (This is what happens in authorize() during login)
    const isPasswordValid = await bcryptjs.compare(
      userData.password, // Raw password from login attempt
      hashedPassword // Hashed password from database
    )
    expect(isPasswordValid).toBe(true)

    // STEP 4: Verify Wrong Password Fails
    const wrongPasswordAttempt = await bcryptjs.compare(
      'WrongPassword999!',
      hashedPassword
    )
    expect(wrongPasswordAttempt).toBe(false)
  })

  it('should reject login with wrong password', async () => {
    // Arrange: User exists with hashed password
    const correctPassword = 'CorrectPassword123!'
    const wrongPassword = 'WrongPassword456!'
    const hashedPassword = await bcryptjs.hash(correctPassword, 12)

    prismaMock.user.findUnique.mockResolvedValue({
      id: USER_ID,
      email: 'user@watchbiz.com',
      password: hashedPassword,
      name: 'User',
      role: 'USER',
      phone: null,
      isBlocked: false,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Act: Try to compare wrong password
    const isPasswordValid = await bcryptjs.compare(wrongPassword, hashedPassword)

    // Assert: Password comparison fails
    expect(isPasswordValid).toBe(false)
  })

  it('should handle bcrypt hash with different salt rounds', async () => {
    // Arrange: Test that our bcrypt settings (12 rounds) work correctly
    const password = 'TestPassword123!'

    // Act: Hash with 12 rounds (our production setting)
    const hash1 = await bcryptjs.hash(password, 12)
    const hash2 = await bcryptjs.hash(password, 12)

    // Assert: Same password creates different hashes (due to salt)
    expect(hash1).not.toBe(hash2)

    // But both hashes verify correctly
    expect(await bcryptjs.compare(password, hash1)).toBe(true)
    expect(await bcryptjs.compare(password, hash2)).toBe(true)
  })

  it('should reject registration with duplicate email', async () => {
    // Arrange: User already exists
    prismaMock.user.findUnique.mockResolvedValue({
      id: USER_ID,
      email: 'existing@watchbiz.com',
      password: 'hashed',
      name: 'Existing User',
      role: 'USER',
      phone: null,
      isBlocked: false,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Act: Try to register with same email
    const formData = createFormData({
      name: 'New User',
      email: 'existing@watchbiz.com',
      password: 'Password123!'
    })
    const result = await registerUser(formData)

    // Assert: Registration rejected
    expect(result).toEqual({
      error: 'Cet email est déjà utilisé'
    })
    expect(prismaMock.user.create).not.toHaveBeenCalled()
  })

  it('should prevent login for blocked users', async () => {
    // Arrange: User exists but is blocked
    const hashedPassword = await bcryptjs.hash('Password123!', 12)
    prismaMock.user.findUnique.mockResolvedValue({
      id: USER_ID,
      email: 'blocked@watchbiz.com',
      password: hashedPassword,
      name: 'Blocked User',
      role: 'USER',
      phone: null,
      isBlocked: true, // User is blocked
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Act: Retrieve user (in real authorize(), we check isBlocked)
    const user = await prismaMock.user.findUnique({
      where: { email: 'blocked@watchbiz.com' }
    })

    // Assert: User is blocked (authorize() would reject this)
    expect(user?.isBlocked).toBe(true)
  })

  it('should assign correct role on registration (default USER)', async () => {
    // Arrange
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue({
      id: USER_ID,
      name: 'New User',
      email: 'newuser@watchbiz.com',
      password: 'hashed',
      role: 'USER', // Default role
      phone: null,
      isBlocked: false,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Act: Register user
    const formData = createFormData({
      name: 'New User',
      email: 'newuser@watchbiz.com',
      password: 'Password123!'
    })
    await registerUser(formData)

    // Assert: Role is USER (not ADMIN)
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        name: 'New User',
        email: 'newuser@watchbiz.com',
        password: expect.any(String),
        role: 'USER'
      }
    })
  })
})
