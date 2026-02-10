'use server'

/**
 * 🔐 Server Actions pour l'authentification
 *
 * Équivalent des controllers dans Express :
 * - registerUser : POST /api/auth/register
 */

import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'

/**
 * Schema de validation pour l'inscription
 *
 * Utilise Zod pour valider les données
 */
const registerSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
})

/**
 * Créer un nouveau compte utilisateur
 *
 * @param formData - Données du formulaire
 * @returns { success: true } ou { error: string }
 */
export async function registerUser(formData: FormData) {
  try {
    // 1. Récupérer et valider les données
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validation = registerSchema.safeParse(data)
    if (!validation.success) {
      return {
        error: validation.error.errors[0].message,
      }
    }

    // 2. Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return {
        error: 'Cet email est déjà utilisé',
      }
    }

    // 3. Hasher le mot de passe avec bcrypt
    const hashedPassword = await hash(data.password, 12)

    // 4. Créer l'utilisateur dans la DB
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'USER', // Rôle par défaut
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Register error:', error)
    return {
      error: 'Une erreur est survenue. Veuillez réessayer.',
    }
  }
}
