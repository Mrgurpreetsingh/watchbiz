'use server'

/**
 * 💳 Server Actions pour le Checkout Stripe
 *
 * Gère la création de session Stripe Checkout et la conversion en Order
 */

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { z } from 'zod'
import type Stripe from 'stripe'
import {
  ShippingMethod,
  SHIPPING_OPTIONS,
  FREE_SHIPPING_THRESHOLD,
  TAX_RATE,
  type CartItem,
  type CreateCheckoutSessionResult
} from '@/types/checkout'

/**
 * Schema de validation pour la création de session Stripe
 */
const checkoutSchema = z.object({
  addressId: z.string().cuid('ID adresse invalide'),
  shippingMethod: z.nativeEnum(ShippingMethod, {
    errorMap: () => ({ message: 'Méthode de livraison invalide' })
  }),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        price: z.number().positive(),
        quantity: z.number().int().positive(),
        image: z.string(),
        slug: z.string()
      })
    )
    .min(1, 'Le panier ne peut pas être vide')
})

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string }

/**
 * 💳 Créer une session Stripe Checkout
 *
 * Cette action crée une session Stripe Checkout et retourne l'URL de redirection
 */
export async function createCheckoutSession(
  addressId: string,
  shippingMethod: ShippingMethod,
  items: CartItem[]
): Promise<ActionResult<CreateCheckoutSessionResult>> {
  try {
    // 1. Vérifier l'authentification
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Non authentifié' }
    }

    // 2. Validation des données
    const validation = checkoutSchema.safeParse({
      addressId,
      shippingMethod,
      items
    })

    if (!validation.success) {
      return {
        success: false,
        error: validation.error.errors[0].message
      }
    }

    const validatedData = validation.data

    // 3. Vérifier que l'adresse appartient bien à l'utilisateur
    const address = await prisma.address.findUnique({
      where: { id: validatedData.addressId }
    })

    if (!address || address.userId !== session.user.id) {
      return { success: false, error: 'Adresse invalide' }
    }

    // 4. Calculer les totaux
    const subtotal = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
    const shippingOption = SHIPPING_OPTIONS.find(
      (opt) => opt.method === validatedData.shippingMethod
    )
    const shippingCost = isFreeShipping ? 0 : shippingOption?.price || 0

    const tax = subtotal * TAX_RATE
    const total = subtotal + shippingCost + tax

    // 5. Créer les line_items pour Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      validatedData.items.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : undefined
          },
          unit_amount: Math.round(item.price * 100) // Convertir en centimes
        },
        quantity: item.quantity
      }))

    // Ajouter les frais de livraison si > 0
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: shippingOption?.label || 'Livraison'
          },
          unit_amount: Math.round(shippingCost * 100)
        },
        quantity: 1
      })
    }

    // 6. Créer la session Stripe Checkout
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout`,
      customer_email: session.user.email || undefined,
      metadata: {
        userId: session.user.id,
        addressId: validatedData.addressId,
        shippingMethod: validatedData.shippingMethod,
        items: JSON.stringify(validatedData.items)
      },
      // Activer les taxes (Stripe Tax automatique)
      automatic_tax: {
        enabled: false // Désactivé car on calcule manuellement
      }
    })

    if (!checkoutSession.url) {
      return { success: false, error: 'Impossible de créer la session Stripe' }
    }

    return {
      success: true,
      data: {
        url: checkoutSession.url,
        sessionId: checkoutSession.id
      }
    }
  } catch (error) {
    console.error('createCheckoutSession error:', error)
    return {
      success: false,
      error: 'Une erreur est survenue lors de la création du paiement'
    }
  }
}

/**
 * 📦 Créer une commande depuis une session Stripe (appelé par webhook)
 *
 * Cette fonction est appelée par le webhook Stripe après paiement réussi
 */
export async function createOrderFromStripe(
  sessionId: string
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  try {
    // 1. Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return { success: false, error: 'Paiement non confirmé' }
    }

    // 2. Extraire les metadata
    const userId = session.metadata?.userId
    const addressId = session.metadata?.addressId
    const shippingMethod = session.metadata?.shippingMethod as ShippingMethod
    const items = JSON.parse(session.metadata?.items || '[]') as CartItem[]

    if (!userId || !addressId || !shippingMethod || items.length === 0) {
      return { success: false, error: 'Métadonnées session invalides' }
    }

    // 3. Calculer les totaux (vérification serveur)
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )

    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
    const shippingOption = SHIPPING_OPTIONS.find(
      (opt) => opt.method === shippingMethod
    )
    const shippingCost = isFreeShipping ? 0 : shippingOption?.price || 0
    const tax = subtotal * TAX_RATE
    const total = subtotal + shippingCost + tax

    // 4. Générer un orderNumber unique
    const orderNumber = `WB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // 5. Vérifier le stock disponible avant de créer la commande
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { stock: true, name: true }
      })

      if (!product) {
        return { success: false, error: `Produit introuvable: ${item.name}` }
      }

      if (product.quantity < item.quantity) {
        return {
          success: false,
          error: `Stock insuffisant pour ${product.name} (disponible: ${product.quantity}, demandé: ${item.quantity})`
        }
      }
    }

    // 6. Créer la commande ET décrémenter le stock en une seule transaction
    const order = await prisma.$transaction(async (tx) => {
      // Créer la commande
      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          addressId,
          subtotal,
          tax,
          shipping: shippingCost,
          total,
          stripePaymentId: session.payment_intent as string,
          paymentMethod: 'card',
          status: 'PROCESSING',
          paymentStatus: 'PAID',
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      })

      // Décrémenter le stock de chaque produit
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        })
      }

      return createdOrder
    })

    console.log('✅ Order created:', order.orderNumber)
    console.log('📦 Stock decremented for', items.length, 'products')

    return {
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber
      }
    }
  } catch (error) {
    console.error('createOrderFromStripe error:', error)
    return {
      success: false,
      error: 'Impossible de créer la commande'
    }
  }
}
