import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { CheckoutForm } from '@/components/checkout/checkout-form'
import { PageTransition } from '@/components/animations/page-transition'

export const metadata: Metadata = {
  title: 'Checkout - WatchBiz',
  description: 'Finalisez votre commande de montres de luxe'
}

export default async function CheckoutPage() {
  // Require auth : redirect si non connecté
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/checkout')
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-heading text-4xl font-bold mb-2">Paiement</h1>
            <p className="text-slate-mid">
              Complétez votre commande en toute sécurité
            </p>
          </div>

          {/* Checkout Form */}
          <CheckoutForm />
        </div>
      </div>
    </PageTransition>
  )
}
