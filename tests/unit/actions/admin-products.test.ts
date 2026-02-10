/**
 * Unit Tests: Admin Products Server Actions
 *
 * Tests for actions/admin-products.ts:
 * - getAdminProducts() - List products (ADMIN only)
 * - createProduct() - Create product (ADMIN only, slug uniqueness)
 * - updateProduct() - Update product (ADMIN only, slug uniqueness)
 * - deleteProduct() - Delete product (ADMIN only, check orders)
 * - getCategoriesAndBrands() - Get options (ADMIN only)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoriesAndBrands
} from '@/actions/admin-products'
import { prismaMock } from '../../mocks/prisma'
import { mockAuthenticatedUser, mockUnauthenticatedUser } from '../../utils/auth-helpers'
import { mockAuth } from '../../mocks/auth'
import { mockProduct } from '../../utils/db-helpers'
import { createFormData } from '../../utils/server-action-helpers'

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn()
}))

// Valid CUID constants
const CATEGORY_ID = 'clwhzg8me000008l51prc3qna'
const BRAND_ID = 'clwhzg8me000108l51prc3qnb'
const PRODUCT_ID = 'clwhzg8me000208l51prc3qnc'

describe('Admin Products: Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('🔒 ADMIN Role Required', () => {
    it('should reject unauthenticated users for getAdminProducts', async () => {
      // Arrange
      mockUnauthenticatedUser()

      // Act
      const result = await getAdminProducts()

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Non autorisé'
      })
      expect(prismaMock.product.findMany).not.toHaveBeenCalled()
    })

    it('should reject USER role for getAdminProducts', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      session.user.role = 'USER'
      mockAuth.mockResolvedValue(session)

      // Act
      const result = await getAdminProducts()

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Non autorisé'
      })
      expect(prismaMock.product.findMany).not.toHaveBeenCalled()
    })

    it('should accept ADMIN role for getAdminProducts', async () => {
      // Arrange
      const session = mockAuthenticatedUser('ADMIN')
      mockAuth.mockResolvedValue(session)

      prismaMock.product.findMany.mockResolvedValue([
        mockProduct({ name: 'Watch 1' }),
        mockProduct({ name: 'Watch 2' })
      ] as any)

      // Act
      const result = await getAdminProducts()

      // Assert
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(2)
      expect(prismaMock.product.findMany).toHaveBeenCalled()
    })

    it('should reject USER role for createProduct', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      mockAuth.mockResolvedValue(session)

      const formData = createFormData({
        name: 'New Watch',
        slug: 'new-watch',
        description: 'A new luxury watch',
        price: 1000,
        stock: 10,
        categoryId: CATEGORY_ID,
        brandId: BRAND_ID,
        images: ['https://example.com/watch.jpg'],
        isFeatured: 'false',
        isActive: 'true'
      })

      // Act
      const result = await createProduct(formData)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Non autorisé'
      })
      expect(prismaMock.product.create).not.toHaveBeenCalled()
    })

    it('should reject USER role for updateProduct', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      mockAuth.mockResolvedValue(session)

      const formData = createFormData({
        name: 'Updated Watch',
        slug: 'updated-watch',
        description: 'Updated description',
        price: 1200,
        stock: 5,
        categoryId: CATEGORY_ID,
        brandId: BRAND_ID,
        images: ['https://example.com/watch.jpg'],
        isFeatured: 'false',
        isActive: 'true'
      })

      // Act
      const result = await updateProduct(PRODUCT_ID, formData)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Non autorisé'
      })
      expect(prismaMock.product.update).not.toHaveBeenCalled()
    })

    it('should reject USER role for deleteProduct', async () => {
      // Arrange
      const session = mockAuthenticatedUser('USER')
      mockAuth.mockResolvedValue(session)

      // Act
      const result = await deleteProduct(PRODUCT_ID)

      // Assert
      expect(result).toEqual({
        success: false,
        error: 'Non autorisé'
      })
      expect(prismaMock.product.delete).not.toHaveBeenCalled()
    })
  })
})

describe('Admin Products: createProduct()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create product with valid data', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    const formData = createFormData({
      name: 'Rolex Submariner',
      slug: 'rolex-submariner',
      description: 'Iconic diving watch',
      price: 8500,
      stock: 5,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: ['https://example.com/rolex.jpg'],
      isFeatured: 'true',
      isActive: 'true'
    })

    prismaMock.product.findUnique.mockResolvedValue(null) // No existing slug
    prismaMock.product.create.mockResolvedValue(mockProduct() as any)

    // Act
    const result = await createProduct(formData)

    // Assert
    expect(result).toEqual({ success: true })
    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Rolex Submariner',
        slug: 'rolex-submariner',
        price: 8500,
        stock: 5
      })
    })
  })

  it('should reject duplicate slug', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    const formData = createFormData({
      name: 'Another Watch',
      slug: 'existing-slug',
      description: 'Description',
      price: 1000,
      stock: 10,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: ['https://example.com/watch.jpg'],
      isFeatured: 'false',
      isActive: 'true'
    })

    // Mock existing product with same slug
    prismaMock.product.findUnique.mockResolvedValue(
      mockProduct({ slug: 'existing-slug' }) as any
    )

    // Act
    const result = await createProduct(formData)

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Ce slug est déjà utilisé'
    })
    expect(prismaMock.product.create).not.toHaveBeenCalled()
  })

  it('should validate required fields', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    const formData = createFormData({
      name: 'A', // Too short
      slug: 'watch',
      description: 'Too short',
      price: -100, // Negative price
      stock: 10,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: [],
      isFeatured: 'false',
      isActive: 'true'
    })

    // Act
    const result = await createProduct(formData)

    // Assert
    expect(result.success).toBe(false)
    expect(result.error).toBeDefined()
    expect(prismaMock.product.create).not.toHaveBeenCalled()
  })
})

describe('Admin Products: updateProduct()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update product with valid data', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    const existingProduct = mockProduct({
      id: PRODUCT_ID,
      slug: 'old-slug',
      name: 'Old Name'
    })

    const formData = createFormData({
      name: 'Updated Name',
      slug: 'new-slug',
      description: 'Updated description',
      price: 1500,
      stock: 20,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: ['https://example.com/updated.jpg'],
      isFeatured: 'true',
      isActive: 'true'
    })

    prismaMock.product.findUnique
      .mockResolvedValueOnce(existingProduct as any) // Check product exists
      .mockResolvedValueOnce(null) // Check new slug doesn't exist

    prismaMock.product.update.mockResolvedValue(mockProduct() as any)

    // Act
    const result = await updateProduct(PRODUCT_ID, formData)

    // Assert
    expect(result).toEqual({ success: true })
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      data: expect.objectContaining({
        name: 'Updated Name',
        slug: 'new-slug',
        price: 1500
      })
    })
  })

  it('should return error if product not found', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    const formData = createFormData({
      name: 'Test',
      slug: 'test',
      description: 'Test',
      price: 100,
      stock: 10,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: ['https://example.com/test.jpg'],
      isFeatured: 'false',
      isActive: 'true'
    })

    prismaMock.product.findUnique.mockResolvedValue(null)

    // Act
    const result = await updateProduct('nonexistent_id', formData)

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Produit introuvable'
    })
    expect(prismaMock.product.update).not.toHaveBeenCalled()
  })

  it('should allow keeping the same slug', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    const existingProduct = mockProduct({
      id: PRODUCT_ID,
      slug: 'same-slug',
      name: 'Product Name'
    })

    const formData = createFormData({
      name: 'Updated Name',
      slug: 'same-slug', // Same slug
      description: 'Description',
      price: 1000,
      stock: 10,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: ['https://example.com/watch.jpg'],
      isFeatured: 'false',
      isActive: 'true'
    })

    prismaMock.product.findUnique.mockResolvedValue(existingProduct as any)
    prismaMock.product.update.mockResolvedValue(mockProduct() as any)

    // Act
    const result = await updateProduct(PRODUCT_ID, formData)

    // Assert
    expect(result).toEqual({ success: true })
    expect(prismaMock.product.update).toHaveBeenCalled()
  })

  it('should reject slug if already used by another product', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    const existingProduct = mockProduct({
      id: PRODUCT_ID,
      slug: 'old-slug'
    })

    const anotherProduct = mockProduct({
      id: 'another_product_id',
      slug: 'taken-slug'
    })

    const formData = createFormData({
      name: 'Test',
      slug: 'taken-slug', // Try to use another product's slug
      description: 'Description',
      price: 1000,
      stock: 10,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: ['https://example.com/watch.jpg'],
      isFeatured: 'false',
      isActive: 'true'
    })

    prismaMock.product.findUnique
      .mockResolvedValueOnce(existingProduct as any) // Check product exists
      .mockResolvedValueOnce(anotherProduct as any) // Check slug is taken

    // Act
    const result = await updateProduct(PRODUCT_ID, formData)

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Ce slug est déjà utilisé'
    })
    expect(prismaMock.product.update).not.toHaveBeenCalled()
  })
})

describe('Admin Products: deleteProduct()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete product if no orders exist', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    prismaMock.product.findUnique.mockResolvedValue(mockProduct({ id: PRODUCT_ID }) as any)
    prismaMock.orderItem.findFirst.mockResolvedValue(null) // No orders
    prismaMock.product.delete.mockResolvedValue(mockProduct() as any)

    // Act
    const result = await deleteProduct(PRODUCT_ID)

    // Assert
    expect(result).toEqual({ success: true })
    expect(prismaMock.product.delete).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID }
    })
  })

  it('should prevent deletion if orders exist', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    prismaMock.product.findUnique.mockResolvedValue(mockProduct({ id: PRODUCT_ID }) as any)
    prismaMock.orderItem.findFirst.mockResolvedValue({
      id: 'order_item_123',
      orderId: 'order_123',
      productId: PRODUCT_ID,
      quantity: 1,
      price: 1000
    } as any)

    // Act
    const result = await deleteProduct(PRODUCT_ID)

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Impossible de supprimer un produit qui a des commandes associées'
    })
    expect(prismaMock.product.delete).not.toHaveBeenCalled()
  })

  it('should return error if product not found', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    prismaMock.product.findUnique.mockResolvedValue(null)

    // Act
    const result = await deleteProduct('nonexistent_id')

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Produit introuvable'
    })
    expect(prismaMock.product.delete).not.toHaveBeenCalled()
  })
})

describe('Admin Products: getCategoriesAndBrands()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return categories and brands for ADMIN', async () => {
    // Arrange
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    prismaMock.category.findMany.mockResolvedValue([
      { id: 'cat_1', name: 'Luxury', slug: 'luxury', createdAt: new Date(), updatedAt: new Date() },
      { id: 'cat_2', name: 'Sport', slug: 'sport', createdAt: new Date(), updatedAt: new Date() }
    ] as any)

    prismaMock.brand.findMany.mockResolvedValue([
      { id: 'brand_1', name: 'Rolex', slug: 'rolex', logo: '', createdAt: new Date(), updatedAt: new Date() },
      { id: 'brand_2', name: 'Omega', slug: 'omega', logo: '', createdAt: new Date(), updatedAt: new Date() }
    ] as any)

    // Act
    const result = await getCategoriesAndBrands()

    // Assert
    expect(result.success).toBe(true)
    expect(result.data?.categories).toHaveLength(2)
    expect(result.data?.brands).toHaveLength(2)
  })

  it('should reject USER role', async () => {
    // Arrange
    const session = mockAuthenticatedUser('USER')
    mockAuth.mockResolvedValue(session)

    // Act
    const result = await getCategoriesAndBrands()

    // Assert
    expect(result).toEqual({
      success: false,
      error: 'Non autorisé'
    })
  })
})
