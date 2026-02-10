'use server'

/**
 * 🔐 Server Actions pour Reset Mot de Passe
 *
 * Gère le flow complet de reset de mot de passe:
 * 1. Demande de reset (génère token, envoie email)
 * 2. Validation token et changement mot de passe
 */

import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import crypto from 'crypto'

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * 📧 Demande de reset de mot de passe
 *
 * Génère un token unique et envoie un email avec le lien de reset
 */
export async function requestPasswordReset(
  email: string
): Promise<ActionResult> {
  try {
    // Valider l'email
    const emailSchema = z.string().email('Email invalide')
    const validatedEmail = emailSchema.parse(email.trim().toLowerCase())

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: validatedEmail },
    })

    // Pour la sécurité, on retourne toujours success même si l'user n'existe pas
    // (évite l'énumération d'emails)
    if (!user) {
      console.log('Password reset requested for non-existent email:', validatedEmail)
      return { success: true } // Ne pas révéler que l'email n'existe pas
    }

    // Vérifier que l'utilisateur a un mot de passe (pas OAuth uniquement)
    if (!user.password) {
      console.log('Password reset requested for OAuth-only account:', validatedEmail)
      return { success: true } // Ne pas révéler la raison
    }

    // Supprimer les anciens tokens de reset pour cet utilisateur
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    })

    // Générer un token sécurisé (32 bytes = 64 caractères hex)
    const token = crypto.randomBytes(32).toString('hex')

    // Token valide pendant 1 heure
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    // Créer le token dans la DB
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    })

    // Envoyer l'email avec le lien de reset
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const resetUrl = `${appUrl}/reset-password/${token}`

    // TODO: Utiliser Resend pour envoyer l'email
    // Pour l'instant, on log juste l'URL
    console.log('Password reset URL for', validatedEmail, ':', resetUrl)
    console.log('Token expires at:', expires.toISOString())

    // En production, décommenter et utiliser Resend:
    /*
    const { sendPasswordResetEmail } = await import('@/lib/email')
    await sendPasswordResetEmail({
      email: validatedEmail,
      name: user.name || 'Client',
      resetUrl,
    })
    */

    return { success: true }
  } catch (error) {
    console.error('requestPasswordReset error:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Une erreur est survenue' }
  }
}

/**
 * 🔑 Reset du mot de passe avec token
 *
 * Valide le token et change le mot de passe
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    // Valider le mot de passe
    const passwordSchema = z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .max(100, 'Le mot de passe est trop long')

    const validatedPassword = passwordSchema.parse(newPassword)

    // Trouver le token dans la DB
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    // Vérifier que le token existe
    if (!resetToken) {
      return {
        success: false,
        error: 'Lien de réinitialisation invalide ou expiré',
      }
    }

    // Vérifier que le token n'est pas expiré
    if (resetToken.expires < new Date()) {
      // Supprimer le token expiré
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })

      return {
        success: false,
        error: 'Le lien de réinitialisation a expiré. Veuillez faire une nouvelle demande.',
      }
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hash(validatedPassword, 12)

    // Mettre à jour le mot de passe de l'utilisateur ET supprimer le token
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ])

    console.log('Password reset successful for user:', resetToken.user.email)

    return { success: true }
  } catch (error) {
    console.error('resetPassword error:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: 'Une erreur est survenue' }
  }
}

/**
 * ✅ Vérifier la validité d'un token de reset
 *
 * Permet de vérifier si un token est valide avant d'afficher le formulaire
 */
export async function verifyResetToken(
  token: string
): Promise<ActionResult<{ email: string }>> {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!resetToken) {
      return { success: false, error: 'Token invalide' }
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      })
      return { success: false, error: 'Token expiré' }
    }

    return {
      success: true,
      data: { email: resetToken.user.email },
    }
  } catch (error) {
    console.error('verifyResetToken error:', error)
    return { success: false, error: 'Erreur de vérification' }
  }
}
