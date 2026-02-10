'use server'

/**
 * 🏠 Server Actions pour la gestion des adresses
 *
 * CRUD complet des adresses utilisateur avec validation Zod
 */

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import type { Address } from '@prisma/client'

/**
 * Schema de validation Zod pour les adresses
 */
export const addressSchema = z.object({
  fullName: z.string().min(2, 'Le nom complet est requis (min 2 caractères)'),
  phone: z.string().min(10, 'Numéro de téléphone invalide (min 10 chiffres)'),
  street: z.string().min(5, 'Adresse trop courte (min 5 caractères)'),
  city: z.string().min(2, 'Ville requise (min 2 caractères)'),
  state: z.string().min(2, 'Région requise (min 2 caractères)'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide (5 chiffres requis)'),
  country: z.string().min(2, 'Pays requis').default('France'),
  isDefault: z.boolean().optional().default(false)
})

export type AddressSchemaType = z.infer<typeof addressSchema>

/**
 * Type de retour des Server Actions
 */
type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * 📋 Récupérer toutes les adresses d'un utilisateur
 */
export async function getUserAddresses(): Promise<ActionResult<Address[]>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' }, // Adresse par défaut en premier
        { createdAt: 'desc' }  // Puis par ordre de création
      ]
    })

    return { success: true, data: addresses }
  } catch (error) {
    console.error('getUserAddresses error:', error)
    return { success: false, error: 'Impossible de récupérer les adresses' }
  }
}

/**
 * ➕ Créer une nouvelle adresse
 */
export async function createAddress(formData: FormData): Promise<ActionResult<Address>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // Validation des données
    const data = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: (formData.get('country') as string) || 'France',
      isDefault: formData.get('isDefault') === 'true'
    }

    const validation = addressSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message
      }
    }

    const validatedData = validation.data

    // Si isDefault=true, désactiver les autres adresses par défaut
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true
        },
        data: { isDefault: false }
      })
    }

    // Créer la nouvelle adresse
    const newAddress = await prisma.address.create({
      data: {
        ...validatedData,
        userId: session.user.id
      }
    })

    revalidatePath('/checkout')
    revalidatePath('/account/addresses')

    return { success: true, data: newAddress }
  } catch (error) {
    console.error('createAddress error:', error)
    return { success: false, error: 'Impossible de créer l\'adresse' }
  }
}

/**
 * ✏️ Mettre à jour une adresse existante
 */
export async function updateAddress(
  addressId: string,
  formData: FormData
): Promise<ActionResult<Address>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'adresse appartient bien à l'utilisateur
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return { success: false, error: 'Adresse non trouvée ou accès refusé' }
    }

    // Validation des données
    const data = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      postalCode: formData.get('postalCode') as string,
      country: (formData.get('country') as string) || 'France',
      isDefault: formData.get('isDefault') === 'true'
    }

    const validation = addressSchema.safeParse(data)
    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message
      }
    }

    const validatedData = validation.data

    // Si isDefault=true, désactiver les autres adresses par défaut
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
          id: { not: addressId } // Sauf celle-ci
        },
        data: { isDefault: false }
      })
    }

    // Mettre à jour l'adresse
    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: validatedData
    })

    revalidatePath('/checkout')
    revalidatePath('/account/addresses')

    return { success: true, data: updatedAddress }
  } catch (error) {
    console.error('updateAddress error:', error)
    return { success: false, error: 'Impossible de mettre à jour l\'adresse' }
  }
}

/**
 * 🗑️ Supprimer une adresse
 */
export async function deleteAddress(addressId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'adresse appartient bien à l'utilisateur
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return { success: false, error: 'Adresse non trouvée ou accès refusé' }
    }

    // Supprimer l'adresse
    await prisma.address.delete({
      where: { id: addressId }
    })

    revalidatePath('/checkout')
    revalidatePath('/account/addresses')

    return { success: true }
  } catch (error) {
    console.error('deleteAddress error:', error)
    return { success: false, error: 'Impossible de supprimer l\'adresse' }
  }
}

/**
 * ⭐ Définir une adresse comme adresse par défaut
 */
export async function setDefaultAddress(addressId: string): Promise<ActionResult> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // Vérifier que l'adresse appartient bien à l'utilisateur
    const existingAddress = await prisma.address.findUnique({
      where: { id: addressId }
    })

    if (!existingAddress || existingAddress.userId !== session.user.id) {
      return { success: false, error: 'Adresse non trouvée ou accès refusé' }
    }

    // Désactiver toutes les autres adresses par défaut
    await prisma.address.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true
      },
      data: { isDefault: false }
    })

    // Activer celle-ci
    await prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    })

    revalidatePath('/checkout')
    revalidatePath('/account/addresses')

    return { success: true }
  } catch (error) {
    console.error('setDefaultAddress error:', error)
    return { success: false, error: 'Impossible de définir l\'adresse par défaut' }
  }
}

/**
 * 📍 Récupérer l'adresse par défaut de l'utilisateur
 */
export async function getDefaultAddress(): Promise<ActionResult<Address | null>> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    const defaultAddress = await prisma.address.findFirst({
      where: {
        userId: session.user.id,
        isDefault: true
      }
    })

    return { success: true, data: defaultAddress }
  } catch (error) {
    console.error('getDefaultAddress error:', error)
    return { success: false, error: 'Impossible de récupérer l\'adresse par défaut' }
  }
}
