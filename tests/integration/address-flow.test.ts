/**
 * Integration Test: Address Management Flow
 *
 * Tests the complete address management flow:
 * 1. Create address with validation
 * 2. Set address as default (disable other defaults)
 * 3. Update address
 * 4. Delete address
 * 5. Verify ownership enforcement
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses
} from '@/actions/addresses'
import { prismaMock } from '../mocks/prisma'
import { mockAuth } from '../mocks/auth'
import { mockAuthenticatedUser } from '../utils/auth-helpers'
import { mockAddress } from '../utils/db-helpers'
import { createFormData } from '../utils/server-action-helpers'

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn()
}))

// Valid CUID constants
const USER_ID = 'clwhzg8me000008l51prc3qna'
const ADDRESS_1_ID = 'clwhzg8me000108l51prc3qnb'
const ADDRESS_2_ID = 'clwhzg8me000208l51prc3qnc'

describe('Integration: Address Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create address successfully', async () => {
    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    mockAuth.mockResolvedValue(session)

    // Arrange: User has no existing addresses
    prismaMock.address.count.mockResolvedValue(0)

    // Arrange: New address data
    const formData = createFormData({
      fullName: 'John Doe',
      phone: '0612345678',
      street: '123 Test Street',
      city: 'Paris',
      state: 'Île-de-France',
      postalCode: '75001',
      country: 'France',
      isDefault: 'false'
    })

    // Arrange: Mock address creation
    const createdAddress = mockAddress({
      id: ADDRESS_1_ID,
      userId: USER_ID,
      fullName: 'John Doe',
      isDefault: false
    })
    prismaMock.address.create.mockResolvedValue(createdAddress as any)

    // Act: Create address
    const result = await createAddress(formData)

    // Assert: Address created successfully
    expect(result.success).toBe(true)
    expect(prismaMock.address.create).toHaveBeenCalled()
  })

  it('should handle setting address as default', async () => {
    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    mockAuth.mockResolvedValue(session)

    // Arrange: User already has addresses
    prismaMock.address.count.mockResolvedValue(1)

    // Arrange: Create new address and set as default
    const formData = createFormData({
      fullName: 'New Default',
      phone: '0612345678',
      street: '456 New Street',
      city: 'Lyon',
      state: 'Auvergne-Rhône-Alpes',
      postalCode: '69001',
      country: 'France',
      isDefault: 'true' // User wants this as default
    })

    // Arrange: Mock updateMany to disable other defaults
    prismaMock.address.updateMany.mockResolvedValue({ count: 1 } as any)

    // Arrange: Mock new address creation
    const newDefaultAddress = mockAddress({
      id: ADDRESS_2_ID,
      userId: USER_ID,
      fullName: 'New Default',
      isDefault: true
    })
    prismaMock.address.create.mockResolvedValue(newDefaultAddress as any)

    // Act: Create new default address
    const result = await createAddress(formData)

    // Assert: Success
    expect(result.success).toBe(true)

    // Assert: Other defaults were updated
    expect(prismaMock.address.updateMany).toHaveBeenCalled()

    // Assert: New address created
    expect(prismaMock.address.create).toHaveBeenCalled()
  })

  it('should complete full address lifecycle: create → update → delete', async () => {
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Create Address
    // ═══════════════════════════════════════════════════════════════

    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    mockAuth.mockResolvedValue(session)

    prismaMock.address.count.mockResolvedValue(0)

    const createFormDataStep = createFormData({
      fullName: 'John Doe',
      phone: '0612345678',
      street: '123 Test Street',
      city: 'Paris',
      state: 'Île-de-France',
      postalCode: '75001',
      country: 'France',
      isDefault: 'false'
    })

    const createdAddress = mockAddress({
      id: ADDRESS_1_ID,
      userId: USER_ID,
      fullName: 'John Doe',
      street: '123 Test Street',
      isDefault: true
    })
    prismaMock.address.create.mockResolvedValue(createdAddress as any)

    // Act: Create address
    const createResult = await createAddress(createFormDataStep)

    // Assert: Address created
    expect(createResult.success).toBe(true)

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Update Address
    // ═══════════════════════════════════════════════════════════════

    // Arrange: Address exists and belongs to user
    prismaMock.address.findUnique.mockResolvedValue(createdAddress as any)

    const updateFormDataStep = createFormData({
      fullName: 'John Doe Updated',
      phone: '0687654321',
      street: '456 Updated Street',
      city: 'Lyon',
      state: 'Auvergne-Rhône-Alpes',
      postalCode: '69001',
      country: 'France',
      isDefault: 'true'
    })

    const updatedAddress = mockAddress({
      id: ADDRESS_1_ID,
      userId: USER_ID,
      fullName: 'John Doe Updated',
      street: '456 Updated Street',
      isDefault: true
    })
    prismaMock.address.update.mockResolvedValue(updatedAddress as any)
    prismaMock.address.updateMany.mockResolvedValue({ count: 0 } as any)

    // Act: Update address
    const updateResult = await updateAddress(ADDRESS_1_ID, updateFormDataStep)

    // Assert: Address updated
    expect(updateResult.success).toBe(true)
    expect(prismaMock.address.update).toHaveBeenCalledWith({
      where: { id: ADDRESS_1_ID },
      data: expect.objectContaining({
        fullName: 'John Doe Updated',
        street: '456 Updated Street',
        city: 'Lyon',
        postalCode: '69001'
      })
    })

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Delete Address
    // ═══════════════════════════════════════════════════════════════

    // Arrange: Address exists and belongs to user
    prismaMock.address.findUnique.mockResolvedValue(updatedAddress as any)
    prismaMock.address.delete.mockResolvedValue(updatedAddress as any)

    // Act: Delete address
    const deleteResult = await deleteAddress(ADDRESS_1_ID)

    // Assert: Address deleted
    expect(deleteResult.success).toBe(true)
    expect(prismaMock.address.delete).toHaveBeenCalledWith({
      where: { id: ADDRESS_1_ID }
    })
  })

  it('should enforce address ownership on update', async () => {
    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    mockAuth.mockResolvedValue(session)

    // Arrange: Address belongs to another user
    const otherUserAddress = mockAddress({
      id: ADDRESS_1_ID,
      userId: 'other_user_id', // Different user
      fullName: 'Other User'
    })
    prismaMock.address.findUnique.mockResolvedValue(otherUserAddress as any)

    const formData = createFormData({
      fullName: 'Hacker',
      phone: '0612345678',
      street: 'Hacker Street',
      city: 'Hack City',
      state: 'Hack State',
      postalCode: '12345',
      country: 'Hackland',
      isDefault: 'false'
    })

    // Act: Try to update address
    const result = await updateAddress(ADDRESS_1_ID, formData)

    // Assert: Update rejected
    expect(result.success).toBe(false)
    expect(result.error).toContain('Adresse non trouvée ou accès refusé')
    expect(prismaMock.address.update).not.toHaveBeenCalled()
  })

  it('should enforce address ownership on delete', async () => {
    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    mockAuth.mockResolvedValue(session)

    // Arrange: Address belongs to another user
    const otherUserAddress = mockAddress({
      id: ADDRESS_1_ID,
      userId: 'other_user_id', // Different user
      fullName: 'Other User'
    })
    prismaMock.address.findUnique.mockResolvedValue(otherUserAddress as any)

    // Act: Try to delete address
    const result = await deleteAddress(ADDRESS_1_ID)

    // Assert: Deletion rejected
    expect(result.success).toBe(false)
    expect(result.error).toContain('Adresse non trouvée ou accès refusé')
    expect(prismaMock.address.delete).not.toHaveBeenCalled()
  })

  it('should retrieve all user addresses', async () => {
    // Arrange: Authenticated user
    const session = mockAuthenticatedUser('USER')
    session.user.id = USER_ID
    mockAuth.mockResolvedValue(session)

    // Arrange: User has multiple addresses
    const addresses = [
      mockAddress({
        id: ADDRESS_1_ID,
        userId: USER_ID,
        fullName: 'Home',
        isDefault: true
      }),
      mockAddress({
        id: ADDRESS_2_ID,
        userId: USER_ID,
        fullName: 'Work',
        isDefault: false
      })
    ]
    prismaMock.address.findMany.mockResolvedValue(addresses as any)

    // Act: Get all addresses
    const result = await getUserAddresses()

    // Assert: All addresses retrieved
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(2)
    expect(result.data![0].fullName).toBe('Home')
    expect(result.data![0].isDefault).toBe(true)
    expect(result.data![1].fullName).toBe('Work')
    expect(result.data![1].isDefault).toBe(false)
  })
})
