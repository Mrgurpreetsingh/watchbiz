import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { ClearCartOnSuccess } from '@/components/checkout/clear-cart-on-success'

export const metadata: Metadata = {
  title: 'Commande réussie - WatchBiz',
  description: 'Merci pour votre commande'
}

interface SuccessPageProps {
  searchParams: Promise<{
    session_id?: string
  }>
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  // Require auth
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Récupérer session_id depuis URL
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    redirect('/checkout')
  }

  // Récupérer les détails de la session Stripe
  let orderNumber = 'N/A'
  let customerEmail = session.user.email

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    if (checkoutSession.payment_status === 'paid') {
      // Le webhook a déjà créé la commande, on peut récupérer le orderNumber
      // depuis les metadata ou depuis la DB (TODO: fetch order from DB)
      orderNumber = `WB-${checkoutSession.created}-${checkoutSession.id.slice(-8).toUpperCase()}`
      customerEmail = checkoutSession.customer_email || session.user.email
    }
  } catch (error) {
    console.error('Error retrieving Stripe session:', error)
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4">
      {/* Clear cart automatiquement */}
      <ClearCartOnSuccess />

      <div className="max-w-2xl w-full">
        {/* Card de succès */}
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 text-center">
          {/* Icône succès */}
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          {/* Titre */}
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Commande confirmée !
          </h1>

          {/* Message */}
          <p className="text-slate-premium text-lg mb-8">
            Merci pour votre commande. Un email de confirmation a été envoyé à{' '}
            <span className="font-semibold text-luxury-black">
              {customerEmail}
            </span>
          </p>

          {/* Numéro de commande */}
          <div className="bg-slate-light/30 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Package className="h-5 w-5 text-gold-champagne" />
              <span className="text-sm text-slate-mid font-medium">
                Numéro de commande
              </span>
            </div>
            <p className="font-accent text-2xl font-bold text-luxury-black">
              {orderNumber}
            </p>
          </div>

          {/* Infos livraison */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              📦 Votre commande sera expédiée sous 24-48h. Vous recevrez un email
              de suivi dès l'expédition.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">
                Continuer mes achats
              </Link>
            </Button>
            <Button asChild size="lg">
              <Link href="/account/orders">
                Voir mes commandes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Message sécurité */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-mid">
            Paiement sécurisé par{' '}
            <span className="font-semibold">Stripe</span>
          </p>
        </div>
      </div>
    </div>
  )
}
