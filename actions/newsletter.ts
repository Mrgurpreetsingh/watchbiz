'use server'

/**
 * 📧 Newsletter Server Actions - Gestion des inscriptions newsletter
 *
 * Features:
 * - Inscription newsletter avec validation email
 * - Désabonnement
 * - Vérification du statut
 * - Gestion des doublons
 */

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export interface NewsletterResult {
  success: boolean
  message?: string
  error?: string
}

/**
 * Valider un email avec regex simple
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * S'abonner à la newsletter
 */
export async function subscribeNewsletter(email: string): Promise<NewsletterResult> {
  try {
    // Validation de l'email
    if (!email || email.trim() === '') {
      return {
        success: false,
        error: 'Veuillez saisir votre adresse email.',
      }
    }

    const trimmedEmail = email.trim().toLowerCase()

    if (!isValidEmail(trimmedEmail)) {
      return {
        success: false,
        error: 'Veuillez saisir une adresse email valide.',
      }
    }

    // Vérifier si l'email existe déjà
    const existing = await prisma.newsletter.findUnique({
      where: { email: trimmedEmail },
    })

    if (existing) {
      if (existing.isActive) {
        return {
          success: false,
          error: 'Cette adresse email est déjà inscrite à notre newsletter.',
        }
      } else {
        // Réactiver l'abonnement si désactivé
        await prisma.newsletter.update({
          where: { email: trimmedEmail },
          data: { isActive: true },
        })

        revalidatePath('/')

        return {
          success: true,
          message: 'Votre abonnement à notre newsletter a été réactivé avec succès !',
        }
      }
    }

    // Créer un nouvel abonnement
    await prisma.newsletter.create({
      data: {
        email: trimmedEmail,
      },
    })

    revalidatePath('/')

    return {
      success: true,
      message: 'Merci ! Vous êtes maintenant inscrit à notre newsletter.',
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return {
      success: false,
      error: 'Une erreur est survenue. Veuillez réessayer.',
    }
  }
}

/**
 * Se désabonner de la newsletter
 */
export async function unsubscribeNewsletter(email: string): Promise<NewsletterResult> {
  try {
    const trimmedEmail = email.trim().toLowerCase()

    if (!isValidEmail(trimmedEmail)) {
      return {
        success: false,
        error: 'Adresse email invalide.',
      }
    }

    const existing = await prisma.newsletter.findUnique({
      where: { email: trimmedEmail },
    })

    if (!existing) {
      return {
        success: false,
        error: 'Cette adresse email n\'est pas inscrite à notre newsletter.',
      }
    }

    // Désactiver l'abonnement au lieu de supprimer
    await prisma.newsletter.update({
      where: { email: trimmedEmail },
      data: { isActive: false },
    })

    revalidatePath('/')

    return {
      success: true,
      message: 'Vous avez été désabonné de notre newsletter avec succès.',
    }
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return {
      success: false,
      error: 'Une erreur est survenue. Veuillez réessayer.',
    }
  }
}

/**
 * Vérifier si un email est inscrit (actif)
 */
export async function isSubscribed(email: string): Promise<boolean> {
  try {
    const trimmedEmail = email.trim().toLowerCase()

    if (!isValidEmail(trimmedEmail)) {
      return false
    }

    const existing = await prisma.newsletter.findUnique({
      where: { email: trimmedEmail },
    })

    return existing?.isActive ?? false
  } catch (error) {
    console.error('Newsletter check error:', error)
    return false
  }
}

/**
 * Admin : Obtenir la liste des abonnés actifs
 */
export async function getSubscribers(): Promise<{ email: string; createdAt: Date }[]> {
  try {
    const subscribers = await prisma.newsletter.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      select: {
        email: true,
        createdAt: true,
      },
    })

    return subscribers
  } catch (error) {
    console.error('Get subscribers error:', error)
    return []
  }
}

/**
 * Admin : Obtenir le nombre d'abonnés actifs
 */
export async function getSubscriberCount(): Promise<number> {
  try {
    const count = await prisma.newsletter.count({
      where: { isActive: true },
    })

    return count
  } catch (error) {
    console.error('Get subscriber count error:', error)
    return 0
  }
}
