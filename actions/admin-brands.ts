'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * 🏷️ Admin Brands Actions
 *
 * Server Actions pour la gestion des marques (CRUD)
 */

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// VALIDATION SCHEMAS
// ============================================

const brandSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  slug: z.string().min(2, 'Le slug doit contenir au moins 2 caractères'),
  description: z.string().optional(),
  logo: z.string().url('URL du logo invalide').optional().or(z.literal(''))
})

// ============================================
// GET ALL BRANDS (Admin) with Filters
// ============================================

interface GetAdminBrandsFilters {
  search?: string
}

export async function getAdminBrands(
  filters: GetAdminBrandsFilters = {}
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

    const brands = await prisma.brand.findMany({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, data: brands }
  } catch (error) {
    console.error('Error fetching admin brands:', error)
    return { success: false, error: 'Erreur lors du chargement des marques' }
  }
}

// ============================================
// GET SINGLE BRAND (Admin)
// ============================================

export async function getBrand(id: string): Promise<ActionResult<any>> {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!brand) {
      return { success: false, error: 'Marque introuvable' }
    }

    return { success: true, data: brand }
  } catch (error) {
    console.error('Error fetching brand:', error)
    return { success: false, error: 'Erreur lors du chargement de la marque' }
  }
}

// ============================================
// CREATE BRAND (Admin)
// ============================================

export async function createBrand(formData: FormData): Promise<ActionResult<string>> {
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
      logo: formData.get('logo') as string
    }

    const validatedData = brandSchema.parse(data)

    // 3. Vérifier unicité du slug
    const existingBrand = await prisma.brand.findUnique({
      where: { slug: validatedData.slug }
    })

    if (existingBrand) {
      return { success: false, error: 'Une marque avec ce slug existe déjà' }
    }

    // 4. Créer la marque
    const brand = await prisma.brand.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        logo: validatedData.logo || null
      }
    })

    // 5. Revalider les caches
    revalidatePath('/admin/brands')
    revalidatePath('/')

    return { success: true, data: brand.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error creating brand:', error)
    return { success: false, error: 'Erreur lors de la création de la marque' }
  }
}

// ============================================
// UPDATE BRAND (Admin)
// ============================================

export async function updateBrand(
  id: string,
  formData: FormData
): Promise<ActionResult<string>> {
  try {
    // 1. Vérifier auth admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // 2. Vérifier que la marque existe
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    })

    if (!existingBrand) {
      return { success: false, error: 'Marque introuvable' }
    }

    // 3. Parser et valider les données
    const data = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      logo: formData.get('logo') as string
    }

    const validatedData = brandSchema.parse(data)

    // 4. Vérifier unicité du slug (sauf si c'est le même)
    if (validatedData.slug !== existingBrand.slug) {
      const slugTaken = await prisma.brand.findUnique({
        where: { slug: validatedData.slug }
      })

      if (slugTaken) {
        return { success: false, error: 'Une marque avec ce slug existe déjà' }
      }
    }

    // 5. Mettre à jour la marque
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description || null,
        logo: validatedData.logo || null
      }
    })

    // 6. Revalider les caches
    revalidatePath('/admin/brands')
    revalidatePath(`/admin/brands/${id}/edit`)
    revalidatePath('/')

    return { success: true, data: brand.id }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Error updating brand:', error)
    return { success: false, error: 'Erreur lors de la mise à jour de la marque' }
  }
}

// ============================================
// DELETE BRAND (Admin)
// ============================================

export async function deleteBrand(id: string): Promise<ActionResult> {
  try {
    // 1. Vérifier auth admin
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { success: false, error: 'Non autorisé' }
    }

    // 2. Vérifier que la marque existe
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    if (!brand) {
      return { success: false, error: 'Marque introuvable' }
    }

    // 3. Empêcher la suppression si des produits sont liés
    if (brand._count.products > 0) {
      return {
        success: false,
        error: `Impossible de supprimer cette marque (${brand._count.products} produit${
          brand._count.products > 1 ? 's' : ''
        } lié${brand._count.products > 1 ? 's' : ''})`
      }
    }

    // 4. Supprimer la marque
    await prisma.brand.delete({
      where: { id }
    })

    // 5. Revalider les caches
    revalidatePath('/admin/brands')
    revalidatePath('/')

    return { success: true }
  } catch (error) {
    console.error('Error deleting brand:', error)
    return { success: false, error: 'Erreur lors de la suppression de la marque' }
  }
}
