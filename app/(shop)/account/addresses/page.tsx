import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserAddresses } from '@/actions/addresses'
import { AddressesPageContent } from '@/components/account/addresses-page-content'
import { MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mes Adresses - WatchBiz',
  description: 'Gérez vos adresses de livraison et de facturation. Ajoutez, modifiez ou supprimez vos adresses enregistrées.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/addresses`,
  },
}

/**
 * 📍 Page Liste Adresses
 *
 * Réutilise les composants du checkout (AddressCard, AddressFormModal)
 */
export default async function AddressesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/addresses')
  }

  // Fetch addresses
  const result = await getUserAddresses()

  if (!result.success || !result.data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-red-600">Erreur lors du chargement des adresses.</p>
      </div>
    )
  }

  const addresses = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-3">
          <MapPin className="h-6 w-6 text-gold-champagne flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-heading text-2xl font-bold text-luxury-black mb-2">
              Mes Adresses
            </h2>
            <p className="text-slate-mid text-sm">
              Gérez vos adresses de livraison enregistrées
            </p>
          </div>
        </div>
      </div>

      {/* Content (Client Component pour les actions) */}
      <AddressesPageContent addresses={addresses} />
    </div>
  )
}
