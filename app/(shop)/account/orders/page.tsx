import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getUserOrders } from '@/actions/orders'
import { OrderCard } from '@/components/account/order-card'
import { Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mes Commandes - WatchBiz',
  description: 'Consultez l\'historique de vos commandes'
}

/**
 * 📦 Page Liste Commandes
 */
export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/orders')
  }

  // Fetch orders
  const result = await getUserOrders()

  if (!result.success || !result.data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-red-600">Erreur lors du chargement des commandes.</p>
      </div>
    )
  }

  const orders = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start gap-3">
          <Package className="h-6 w-6 text-gold-champagne flex-shrink-0 mt-0.5" />
          <div>
            <h2 className="font-heading text-2xl font-bold text-luxury-black mb-2">
              Mes Commandes
            </h2>
            <p className="text-slate-mid text-sm">
              Consultez l'historique et le suivi de vos commandes
            </p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="h-16 w-16 text-slate-mid mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
            Aucune commande
          </h3>
          <p className="text-slate-mid mb-6">
            Vous n'avez pas encore passé de commande.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
