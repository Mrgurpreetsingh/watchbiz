import { Metadata } from 'next'
import { CartPageContent } from '@/components/cart/cart-page-content'
import { PageTransition } from '@/components/animations/page-transition'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  title: 'Panier - WatchBiz',
  description: 'Votre panier de montres de luxe',
  alternates: {
    canonical: `${baseUrl}/cart`,
  },
}

export default function CartPage() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-ivory">
      <div className="container mx-auto px-4 py-12">
        <h1 className="font-heading text-4xl font-bold mb-8">Mon Panier</h1>
        <CartPageContent />
      </div>
    </PageTransition>
  )
}
