'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * 📁 Admin Categories Actions
 *
 * Server Actions pour la gestion des catégories (CRUD)
 */

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const categorySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  slug: z.string().min(2, 'Le slug doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  image: z.string().url('URL de l\'image invalide').optional().or(z.literal(''))
})

// ============================================
// GET ALL CATEGORIES (Admin) with Filters
// ============================================

interface GetAdminCategoriesFilters {
  search?: string
}

export async function getAdminCategories(
  filters: GetAdminCategoriesFilters = {}
): Promise<ActionResult<any[]>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // Build where clause
    const where: any = {}

    // Search filter (name or slug)
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } }
      ]
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching admin categories:', error)
    return { success: false, error: 'Erreur lors du chargement des catégories' }
  }
}

// ============================================
// GET SINGLE CATEGORY (Admin)
// ============================================

export async function getCategory(id: string): Promise<ActionResult<any>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return { success: false, error: 'Catégorie introuvable' }
    }

    return { success: true, data: category }
  } catch (error) {
    console.error('Error fetching category:', error)
    return { success: false, error: 'Erreur lors du chargement de la catégorie' }
  }
}

// ============================================
// CREATE CATEGORY (Admin)
// ============================================

export async function createCategory(formData: FormData): Promise<ActionResult<string>> {
  try {
    // 1. Vérifier auth admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // 2. Parser et valider les données
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      image: formData.get('image') as string
    }

    const validatedData = categorySchema.parse(data)

    // 3. Vérifier unicité du slug
    const existingCategory = await prisma.category.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingCategory) {
      return { success: false, error: 'Une catégorie avec ce slug existe déjà' }
    }

    // 4. Créer la catégorie
    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        image: validatedData.image || null
      }
    })

    // 5. Revalider les caches
    revalidatePath('/admin/categories')
    revalidatePath('/')

    return { success: true, data: category.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error creating category:', error)
    return { success: false, error: 'Erreur lors de la création de la catégorie' }
  }
}

// ============================================
// UPDATE CATEGORY (Admin)
// ============================================

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResult<string>> {
  try {
    // 1. Vérifier auth admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // 2. Vérifier que la catégorie existe
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return { success: false, error: 'Catégorie introuvable' }
    }

    // 3. Parser et valider les données
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      image: formData.get('image') as string
    }

    const validatedData = categorySchema.parse(data)

    // 4. Vérifier unicité du slug (sauf si c'est le même)
    if (validatedData.slug !== existingCategory.slug) {
      const slugTaken = await prisma.category.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugTaken) {
        return { success: false, error: 'Une catégorie avec ce slug existe déjà' }
      }
    }

    // 5. Mettre à jour la catégorie
    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        image: validatedData.image || null
      }
    })

    // 6. Revalider les caches
    revalidatePath('/admin/categories')
    revalidatePath(`/admin/categories/${id}/edit`)
    revalidatePath('/')

    return { success: true, data: category.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error updating category:', error)
    return { success: false, error: 'Erreur lors de la mise à jour de la catégorie' }
  }
}

// ============================================
// DELETE CATEGORY (Admin)
// ============================================

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    // 1. Vérifier auth admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // 2. Vérifier que la catégorie existe
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!category) {
      return { success: false, error: 'Catégorie introuvable' }
    }

    // 3. Empêcher la suppression si des produits sont liés
    if (category._count.products > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette catégorie (${category._count.products} produit${
          category._count.products > 1 ? 's' : ''
        } lié${category._count.products > 1 ? 's' : ''})`
      }
    }

    // 4. Supprimer la catégorie
    await prisma.category.delete({
      where: { id }
    })

    // 5. Revalider les caches
    revalidatePath('/admin/categories')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Erreur lors de la suppression de la catégorie' }
  }
}
