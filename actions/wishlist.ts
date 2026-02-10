'use server'

import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

/**
 * 💝 Server Actions - Gestion Wishlist
 */

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// ADD TO WISHLIST
// ============================================

export async function addToWishlist(productId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié. Veuillez vous connecter.' }
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return { success: false, error: 'Produit introuvable.' }
    }

    // Vérifier si déjà dans la wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    if (existing) {
      return { success: false, error: 'Ce produit est déjà dans votre liste de souhaits.' }
    }

    // Ajouter à la wishlist
    await prisma.wishlist.create({
      data: {
        userId: session.user.id,
        productId,
      },
    })

    revalidatePath('/account/wishlist')
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Error adding to wishlist:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de l\'ajout à la wishlist.',
    }
  }
}

// ============================================
// REMOVE FROM WISHLIST
// ============================================

export async function removeFromWishlist(productId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié. Veuillez vous connecter.' }
    }

    // Supprimer de la wishlist
    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    revalidatePath('/account/wishlist')
    revalidatePath('/products')
    return { success: true }
  } catch (error) {
    console.error('Error removing from wishlist:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la suppression de la wishlist.',
    }
  }
}

// ============================================
// GET WISHLIST
// ============================================

export async function getWishlist() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { success: true, data: wishlist }
  } catch (error) {
    console.error('Error fetching wishlist:', error)
    return { success: false, error: 'Erreur lors de la récupération de la wishlist' }
  }
}

// ============================================
// CHECK IF IN WISHLIST
// ============================================

export async function isInWishlist(productId: string): Promise<ActionResult<boolean>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: true, data: false }
    }

    const wishlistItem = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    })

    return { success: true, data: !!wishlistItem }
  } catch (error) {
    console.error('Error checking wishlist:', error)
    return { success: false, error: 'Erreur lors de la vérification' }
  }
}

// ============================================
// GET WISHLIST COUNT
// ============================================

export async function getWishlistCount(): Promise<ActionResult<number>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: true, data: 0 }
    }

    const count = await prisma.wishlist.count({
      where: { userId: session.user.id },
    })

    return { success: true, data: count }
  } catch (error) {
    console.error('Error counting wishlist:', error)
    return { success: false, error: 'Erreur lors du comptage' }
  }
}
