'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * 📦 Admin Products Actions
 *
 * Server Actions pour la gestion des produits (CRUD)
 */

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// GET ALL PRODUCTS (Admin) with Filters
// ============================================

interface GetAdminProductsFilters {
  search?: string
  categoryId?: string
  brandId?: string
  isActive?: string
  lowStock?: boolean
}

export async function getAdminProducts(filters: GetAdminProductsFilters = {}) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Build where clause
    const where: any = {}

    // Search filter (name or SKU)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    // Category filter
    if (filters.categoryId) {
      where.categoryId = filters.categoryId
    }

    // Brand filter
    if (filters.brandId) {
      where.brandId = filters.brandId
    }

    // Active filter
    if (filters.isActive) {
      where.isActive = filters.isActive === 'true'
    }

    // Low stock filter (< 10)
    if (filters.lowStock) {
      where.quantity = { lt: 10 }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: products }
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return { success: false, error: 'Erreur lors du chargement des produits' }
  }
}

// ============================================
// CREATE PRODUCT
// ============================================

const createProductSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  slug: z.string().min(2, 'Le slug est requis'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.number().positive('Le prix doit être positif'),
  compareAtPrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  sku: z.string().optional(),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif'),
  categoryId: z.string().cuid('ID de catégorie invalide'),
  brandId: z.string().cuid('ID de marque invalide'),
  images: z.array(z.string().url()).min(1, 'Au moins une image est requise'),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional()
})

export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Parse form data
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      compareAtPrice: formData.get('compareAtPrice')
        ? parseFloat(formData.get('compareAtPrice') as string)
        : undefined,
      costPrice: formData.get('costPrice') ? parseFloat(formData.get('costPrice') as string) : undefined,
      sku: (formData.get('sku') as string) || undefined,
      stock: parseInt(formData.get('stock') as string, 10),
      categoryId: formData.get('categoryId') as string,
      brandId: formData.get('brandId') as string,
      images: JSON.parse(formData.get('images') as string),
      isFeatured: formData.get('isFeatured') === 'true',
      isActive: formData.get('isActive') === 'true'
    }

    // Validation
    const validation = createProductSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    const validatedData = validation.data

    // Check if slug already exists
    const existingProduct = await prisma.product.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingProduct) {
      return { success: false, error: 'Ce slug est déjà utilisé' }
    }

    // Create product
    await prisma.product.create({
      data: validatedData
    })

    revalidatePath('/products')
    revalidatePath('/admin/products')

    return { success: true }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Erreur lors de la création du produit' }
  }
}

// ============================================
// UPDATE PRODUCT
// ============================================

export async function updateProduct(productId: string, formData: FormData): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existingProduct) {
      return { success: false, error: 'Produit introuvable' }
    }

    // Parse form data
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      compareAtPrice: formData.get('compareAtPrice')
        ? parseFloat(formData.get('compareAtPrice') as string)
        : undefined,
      costPrice: formData.get('costPrice') ? parseFloat(formData.get('costPrice') as string) : undefined,
      sku: (formData.get('sku') as string) || undefined,
      stock: parseInt(formData.get('stock') as string, 10),
      categoryId: formData.get('categoryId') as string,
      brandId: formData.get('brandId') as string,
      images: JSON.parse(formData.get('images') as string),
      isFeatured: formData.get('isFeatured') === 'true',
      isActive: formData.get('isActive') === 'true'
    }

    // Validation
    const validation = createProductSchema.safeParse(data)
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message }
    }

    const validatedData = validation.data

    // Check if slug already exists (excluding current product)
    if (validatedData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugExists) {
        return { success: false, error: 'Ce slug est déjà utilisé' }
      }
    }

    // Update product
    await prisma.product.update({
      where: { id: productId },
      data: validatedData
    })

    revalidatePath('/products')
    revalidatePath(`/products/${validatedData.slug}`)
    revalidatePath('/admin/products')

    return { success: true }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Erreur lors de la mise à jour du produit' }
  }
}

// ============================================
// DELETE PRODUCT
// ============================================

export async function deleteProduct(productId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return { success: false, error: 'Produit introuvable' }
    }

    // Check if product has orders
    const hasOrders = await prisma.orderItem.findFirst({
      where: { productId }
    })

    if (hasOrders) {
      return {
        success: false,
        error: 'Impossible de supprimer un produit qui a des commandes associées'
      }
    }

    // Delete product (reviews will be deleted by cascade)
    await prisma.product.delete({
      where: { id: productId }
    })

    revalidatePath('/products')
    revalidatePath('/admin/products')

    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Erreur lors de la suppression du produit' }
  }
}

// ============================================
// GET CATEGORIES & BRANDS (for forms)
// ============================================

export async function getCategoriesAndBrands() {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    const [categories, brands] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.brand.findMany({ orderBy: { name: 'asc' } })
    ])

    return { success: true, data: { categories, brands } }
  } catch (error) {
    console.error('Error fetching categories and brands:', error)
    return { success: false, error: 'Erreur lors du chargement' }
  }
}
