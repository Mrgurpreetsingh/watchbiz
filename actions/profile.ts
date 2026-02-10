'use server'

import { z } from 'zod'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { compare, hash } from 'bcryptjs'
import { revalidatePath } from 'next/cache'

/**
 * 👤 Server Actions - Gestion Profil Utilisateur
 */

// Types
export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ============================================
// UPDATE PROFILE
// ============================================

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  email: z.string().email('Email invalide').optional(),
  phone: z.string().min(10, 'Numéro de téléphone invalide (min 10 chiffres)').optional(),
  image: z.string().url('URL d\'avatar invalide').optional().nullable()
})

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    // Auth check
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié. Veuillez vous reconnecter.' }
    }

    // Parse form data
    const data = {
      name: formData.get('name') as string | undefined,
      email: formData.get('email') as string | undefined,
      phone: formData.get('phone') as string | undefined,
      image: formData.get('image') as string | undefined
    }

    // Validation Zod
    const validation = updateProfileSchema.safeParse(data)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message
      }
    }

    const validatedData = validation.data

    // Si email modifié, vérifier s'il n'est pas déjà utilisé
    if (validatedData.email && validatedData.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (existingUser) {
        return {
          success: false,
          error: 'Cet email est déjà utilisé par un autre compte.'
        }
      }
    }

    // Update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.email && { email: validatedData.email }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone }),
        ...(validatedData.image !== undefined && { image: validatedData.image })
      }
    })

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la mise à jour du profil.'
    }
  }
}

// ============================================
// UPDATE PASSWORD
// ============================================

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    ),
  confirmPassword: z.string().min(1, 'La confirmation est requise')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

export async function updatePassword(formData: FormData): Promise<ActionResult> {
  try {
    // Auth check
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié. Veuillez vous reconnecter.' }
    }

    // Parse form data
    const data = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string
    }

    // Validation Zod
    const validation = updatePasswordSchema.safeParse(data)

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message
      }
    }

    const { currentPassword, newPassword } = validation.data

    // Récupérer le user avec password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true }
    })

    if (!user?.password) {
      return {
        success: false,
        error: 'Aucun mot de passe défini pour ce compte (connexion sociale).'
      }
    }

    // Vérifier le mot de passe actuel
    const isPasswordValid = await compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Le mot de passe actuel est incorrect.'
      }
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error) {
    console.error('Error updating password:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la modification du mot de passe.'
    }
  }
}

// ============================================
// GET USER PROFILE
// ============================================

export async function getUserProfile() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
        createdAt: true
      }
    })

    if (!user) {
      return { success: false, error: 'Utilisateur introuvable' }
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return { success: false, error: 'Erreur lors de la récupération du profil' }
  }
}
