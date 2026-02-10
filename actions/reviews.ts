'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * ⭐ Server Actions - Gestion Reviews
 */

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// CREATE REVIEW
// ============================================

const createReviewSchema = z.object({
  productId: z.string().cuid('ID produit invalide'),
  rating: z
    .number()
    .int('La note doit être un entier')
    .min(1, 'La note minimale est 1')
    .max(5, 'La note maximale est 5'),
  title: z.string().max(100, 'Le titre est trop long (max 100 caractères)').optional(),
  comment: z
    .string()
    .min(10, 'Le commentaire doit contenir au moins 10 caractères')
    .max(1000, 'Le commentaire est trop long (max 1000 caractères)')
})

export async function createReview(formData: FormData): Promise<ActionResult> {
  try {
    // Auth check
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Vous devez être connecté pour laisser un avis.' }
    }

    // Parse form data
    const data = {
      productId: formData.get('productId') as string,
      rating: parseInt(formData.get('rating') as string, 10),
      title: (formData.get('title') as string) || undefined,
      comment: formData.get('comment') as string
    }

    // Validation Zod
    const validation = createReviewSchema.safeParse(data)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message
      }
    }

    const validatedData = validation.data

    // Vérifier si le produit existe
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId }
    })

    if (!product) {
      return { success: false, error: 'Produit introuvable.' }
    }

    // Vérifier si l'utilisateur a déjà laissé un avis pour ce produit
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: validatedData.productId
        }
      }
    })

    if (existingReview) {
      return {
        success: false,
        error: 'Vous avez déjà laissé un avis pour ce produit. Vous pouvez le modifier depuis votre profil.'
      }
    }

    // TODO: Vérifier si l'utilisateur a acheté ce produit (pour isVerified)
    // Pour l'instant, on met isVerified = false par défaut
    const hasOrderedProduct = await prisma.orderItem.findFirst({
      where: {
        productId: validatedData.productId,
        order: {
          userId: session.user.id,
          paymentStatus: 'PAID'
        }
      }
    })

    const isVerified = !!hasOrderedProduct

    // Create review
    await prisma.review.create({
      data: {
        userId: session.user.id,
        productId: validatedData.productId,
        rating: validatedData.rating,
        title: validatedData.title,
        comment: validatedData.comment,
        isVerified
      }
    })

    // Revalidate product page
    revalidatePath(`/products/${product.slug}`)

    return { success: true }
  } catch (error) {
    console.error('Error creating review:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la création de l\'avis.'
    }
  }
}

// ============================================
// GET PRODUCT REVIEWS
// ============================================

export async function getProductReviews(productId: string) {
  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate average rating
    const totalReviews = reviews.length
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
        : 0

    // Count by rating (for histogram)
    const ratingCounts = reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1
        return acc
      },
      {} as Record<number, number>
    )

    return {
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating,
        ratingCounts
      }
    }
  } catch (error) {
    console.error('Error fetching product reviews:', error)
    return {
      success: false,
      error: 'Erreur lors de la récupération des avis'
    }
  }
}

// ============================================
// CHECK IF USER CAN REVIEW
// ============================================

export async function canUserReview(productId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: true, data: { canReview: false, reason: 'not_logged_in' } }
    }

    // Check if already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId
        }
      }
    })

    if (existingReview) {
      return { success: true, data: { canReview: false, reason: 'already_reviewed' } }
    }

    return { success: true, data: { canReview: true } }
  } catch (error) {
    console.error('Error checking review eligibility:', error)
    return { success: false, error: 'Erreur lors de la vérification' }
  }
}
