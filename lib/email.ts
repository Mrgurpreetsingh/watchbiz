import { Resend } from 'resend'
import { render } from '@react-email/render'
import OrderConfirmationEmail from '@/emails/order-confirmation'

/**
 * 📧 Email Service
 *
 * Service pour envoyer des emails avec Resend
 */

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY is missing in .env.local')
}

const resend = new Resend(process.env.RESEND_API_KEY)

// Default "from" email (must be verified in Resend dashboard)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'WatchBiz <onboarding@resend.dev>'

interface OrderEmailData {
  orderNumber: string
  customerName: string
  customerEmail: string
  orderDate: string
  items: Array<{
    name: string
    quantity: number
    price: number
    image: string
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingAddress: {
    fullName: string
    street: string
    city: string
    postalCode: string
    country: string
  }
  orderDetailsUrl: string
}

/**
 * Envoie un email de confirmation de commande
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  try {
    // Render React Email template to HTML
    const emailHtml = await render(
      OrderConfirmationEmail({
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        orderDate: data.orderDate,
        items: data.items,
        subtotal: data.subtotal,
        shipping: data.shipping,
        tax: data.tax,
        total: data.total,
        shippingAddress: data.shippingAddress,
        orderDetailsUrl: data.orderDetailsUrl
      })
    )

    // Send email with Resend
    const response = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Confirmation de commande ${data.orderNumber} - WatchBiz`,
      html: emailHtml
    })

    console.log('✅ Order confirmation email sent:', response.id)
    return { success: true, id: response.id }
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Envoie un email de notification d'expédition (future feature)
 */
export async function sendShippingNotificationEmail(data: {
  orderNumber: string
  customerEmail: string
  trackingNumber: string
  carrier: string
}) {
  // TODO: Implémenter le template email shipping
  console.log('📦 Shipping notification email:', data)
  return { success: true }
}

/**
 * Envoie un email de réinitialisation de mot de passe (future feature)
 */
export async function sendPasswordResetEmail(data: {
  email: string
  resetToken: string
  resetUrl: string
}) {
  // TODO: Implémenter le template email password reset
  console.log('🔑 Password reset email:', data)
  return { success: true }
}
