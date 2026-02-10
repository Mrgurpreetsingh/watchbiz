/**
 * 🔔 Webhook Stripe
 *
 * Écoute les événements Stripe (checkout.session.completed)
 * et crée la commande dans la DB après paiement réussi
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { createOrderFromStripe } from '@/actions/checkout'
import { sendOrderConfirmationEmail } from '@/lib/email'
import prisma from '@/lib/prisma'
import type Stripe from 'stripe'

/**
 * POST /api/webhooks/stripe
 *
 * Handler du webhook Stripe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('❌ Webhook error: No signature header')
      return NextResponse.json(
        { error: 'No signature header' },
        { status: 400 }
      )
    }

    if (!STRIPE_WEBHOOK_SECRET) {
      console.error('❌ Webhook error: No webhook secret configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      )
    }

    // Vérifier la signature du webhook
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Traiter l'événement
    console.log('📨 Stripe webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        console.log('💳 Checkout session completed:', session.id)

        // Créer la commande dans la DB
        const result = await createOrderFromStripe(session.id)

        if (result.success && result.data) {
          console.log('✅ Order created:', result.data.orderNumber)

          // Envoyer l'email de confirmation
          try {
            // Fetch order complète avec relations
            const order = await prisma.order.findUnique({
              where: { id: result.data.orderId },
              include: {
                user: true,
                items: {
                  include: {
                    product: true
                  }
                },
                shippingAddress: true
              }
            })

            if (order && order.user.email && order.shippingAddress) {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

              await sendOrderConfirmationEmail({
                orderNumber: order.orderNumber,
                customerName: order.user.name || 'Client',
                customerEmail: order.user.email,
                orderDate: order.createdAt.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }),
                items: order.items.map((item) => ({
                  name: item.product.name,
                  quantity: item.quantity,
                  price: item.price,
                  image: item.product.images[0] || ''
                })),
                subtotal: order.subtotal,
                shipping: order.shipping,
                tax: order.tax,
                total: order.total,
                shippingAddress: {
                  fullName: order.shippingAddress.fullName,
                  street: order.shippingAddress.street,
                  city: order.shippingAddress.city,
                  postalCode: order.shippingAddress.postalCode,
                  country: order.shippingAddress.country
                },
                orderDetailsUrl: `${appUrl}/account/orders/${order.id}`
              })

              console.log('📧 Order confirmation email sent to:', order.user.email)
            } else {
              console.warn('⚠️ Order missing user email or shipping address, email not sent')
            }
          } catch (emailError) {
            // Log error mais ne pas fail le webhook
            console.error('❌ Failed to send order confirmation email:', emailError)
          }
        } else {
          console.error('❌ Failed to create order:', result.error)
          // On retourne quand même 200 pour éviter que Stripe retry indéfiniment
        }

        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('💰 Payment intent succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('❌ Payment intent failed:', paymentIntent.id)
        break
      }

      default: {
        console.log('ℹ️ Unhandled event type:', event.type)
      }
    }

    // Retourner 200 pour confirmer la réception
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
