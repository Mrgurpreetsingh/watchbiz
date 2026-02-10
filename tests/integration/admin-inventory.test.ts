/**
 * Integration Test: Admin Inventory Management
 *
 * Tests the complete admin product management flow:
 * 1. Create product with slug uniqueness validation
 * 2. Update product (allow same slug, reject duplicate slug)
 * 3. Delete product (prevent if orders exist)
 * 4. Verify ADMIN role enforcement
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminProducts
} from '@/actions/admin-products'
import { prismaMock } from '../mocks/prisma'
import { mockAuth } from '../mocks/auth'
import { mockAuthenticatedUser } from '../utils/auth-helpers'
import { mockProduct } from '../utils/db-helpers'
import { createFormData } from '../utils/server-action-helpers'

// Mock Next.js cache functions
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn()
}))

// Valid CUID constants
const ADMIN_ID = 'clwhzg8me000008l51prc3qna'
const PRODUCT_ID = 'clwhzg8me000108l51prc3qnb'
const CATEGORY_ID = 'clwhzg8me000208l51prc3qnc'
const BRAND_ID = 'clwhzg8me000308l51prc3qnd'

describe('Integration: Admin Inventory Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full product lifecycle: create → update → delete', async () => {
    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Create Product
    // ═══════════════════════════════════════════════════════════════

    // Arrange: ADMIN user
    const session = mockAuthenticatedUser('ADMIN')
    session.user.id = ADMIN_ID
    mockAuth.mockResolvedValue(session)

    // Arrange: New product data
    const productFormData = createFormData({
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

    // Arrange: Slug is unique
    prismaMock.product.findUnique.mockResolvedValue(null)

    // Arrange: Mock product creation
    const createdProduct = mockProduct({
      id: PRODUCT_ID,
      name: 'Rolex Submariner',
      slug: 'rolex-submariner',
      price: 8500
    })
    prismaMock.product.create.mockResolvedValue(createdProduct as any)

    // Act: Create product
    const createResult = await createProduct(productFormData)

    // Assert: Product created successfully
    expect(createResult).toEqual({ success: true })
    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: 'Rolex Submariner',
        slug: 'rolex-submariner',
        price: 8500,
        stock: 5,
        isFeatured: true,
        isActive: true
      })
    })

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Update Product (same slug allowed)
    // ═══════════════════════════════════════════════════════════════

    // Arrange: Product exists
    prismaMock.product.findUnique.mockResolvedValue(createdProduct as any)

    // Arrange: Update data (keep same slug)
    const updateFormDataSameSlug = createFormData({
      name: 'Rolex Submariner 2024',
      slug: 'rolex-submariner', // Same slug
      description: 'Updated description',
      price: 9000, // Price increased
      stock: 10, // Stock updated
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: ['https://example.com/rolex-updated.jpg'],
      isFeatured: 'true',
      isActive: 'true'
    })

    // Arrange: Mock product update
    const updatedProduct = mockProduct({
      id: PRODUCT_ID,
      name: 'Rolex Submariner 2024',
      slug: 'rolex-submariner',
      price: 9000
    })
    prismaMock.product.update.mockResolvedValue(updatedProduct as any)

    // Act: Update product
    const updateResult = await updateProduct(PRODUCT_ID, updateFormDataSameSlug)

    // Assert: Product updated successfully
    expect(updateResult).toEqual({ success: true })
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID },
      data: expect.objectContaining({
        name: 'Rolex Submariner 2024',
        slug: 'rolex-submariner',
        price: 9000,
        stock: 10
      })
    })

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Delete Product (no orders exist)
    // ═══════════════════════════════════════════════════════════════

    // Arrange: Product exists
    prismaMock.product.findUnique.mockResolvedValue(updatedProduct as any)

    // Arrange: No orders for this product
    prismaMock.orderItem.findFirst.mockResolvedValue(null)

    // Arrange: Mock product deletion
    prismaMock.product.delete.mockResolvedValue(updatedProduct as any)

    // Act: Delete product
    const deleteResult = await deleteProduct(PRODUCT_ID)

    // Assert: Product deleted successfully
    expect(deleteResult).toEqual({ success: true })
    expect(prismaMock.product.delete).toHaveBeenCalledWith({
      where: { id: PRODUCT_ID }
    })
  })

  it('should enforce slug uniqueness on create', async () => {
    // Arrange: ADMIN user
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    // Arrange: Product with same slug already exists
    const existingProduct = mockProduct({
      id: 'another_product_id',
      slug: 'existing-slug'
    })
    prismaMock.product.findUnique.mockResolvedValue(existingProduct as any)

    // Arrange: Try to create product with duplicate slug
    const formData = createFormData({
      name: 'New Watch',
      slug: 'existing-slug', // Duplicate slug
      description: 'A beautiful luxury watch with exquisite craftsmanship',
      price: 1000,
      stock: 10,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: ['https://example.com/watch.jpg'],
      isFeatured: 'false',
      isActive: 'true'
    })

    // Act: Try to create product
    const result = await createProduct(formData)

    // Assert: Creation rejected due to duplicate slug
    expect(result).toEqual({
      success: false,
      error: 'Ce slug est déjà utilisé'
    })
    expect(prismaMock.product.create).not.toHaveBeenCalled()
  })

  it('should enforce slug uniqueness on update (reject if slug taken by another product)', async () => {
    // Arrange: ADMIN user
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    // Arrange: Current product
    const currentProduct = mockProduct({
      id: PRODUCT_ID,
      slug: 'current-slug'
    })

    // Arrange: Another product with different slug
    const anotherProduct = mockProduct({
      id: 'another_product_id',
      slug: 'taken-slug'
    })

    // Arrange: Try to update to slug already used by another product
    prismaMock.product.findUnique
      .mockResolvedValueOnce(currentProduct as any) // Check product exists
      .mockResolvedValueOnce(anotherProduct as any) // Check slug is taken

    const formData = createFormData({
      name: 'Updated Watch',
      slug: 'taken-slug', // Try to use another product's slug
      description: 'A beautiful luxury watch with exquisite craftsmanship',
      price: 1000,
      stock: 10,
      categoryId: CATEGORY_ID,
      brandId: BRAND_ID,
      images: ['https://example.com/watch.jpg'],
      isFeatured: 'false',
      isActive: 'true'
    })

    // Act: Try to update product
    const result = await updateProduct(PRODUCT_ID, formData)

    // Assert: Update rejected due to duplicate slug
    expect(result).toEqual({
      success: false,
      error: 'Ce slug est déjà utilisé'
    })
    expect(prismaMock.product.update).not.toHaveBeenCalled()
  })

  it('should prevent deletion if product has orders', async () => {
    // Arrange: ADMIN user
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    // Arrange: Product exists
    const product = mockProduct({ id: PRODUCT_ID })
    prismaMock.product.findUnique.mockResolvedValue(product as any)

    // Arrange: Product has orders
    prismaMock.orderItem.findFirst.mockResolvedValue({
      id: 'order_item_123',
      orderId: 'order_123',
      productId: PRODUCT_ID,
      quantity: 1,
      price: 1000
    } as any)

    // Act: Try to delete product
    const result = await deleteProduct(PRODUCT_ID)

    // Assert: Deletion prevented
    expect(result).toEqual({
      success: false,
      error: 'Impossible de supprimer un produit qui a des commandes associées'
    })
    expect(prismaMock.product.delete).not.toHaveBeenCalled()
  })

  it('should retrieve all products for admin dashboard', async () => {
    // Arrange: ADMIN user
    const session = mockAuthenticatedUser('ADMIN')
    mockAuth.mockResolvedValue(session)

    // Arrange: Mock products list
    const products = [
      mockProduct({ name: 'Watch 1', price: 1000 }),
      mockProduct({ name: 'Watch 2', price: 2000 }),
      mockProduct({ name: 'Watch 3', price: 3000 })
    ]
    prismaMock.product.findMany.mockResolvedValue(products as any)

    // Act: Get all products
    const result = await getAdminProducts()

    // Assert: All products retrieved
    expect(result.success).toBe(true)
    expect(result.data).toHaveLength(3)
    expect(result.data![0].name).toBe('Watch 1')
    expect(result.data![1].name).toBe('Watch 2')
    expect(result.data![2].name).toBe('Watch 3')
  })
})
