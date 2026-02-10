import { getAdminOrders } from '@/actions/admin-orders'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/admin/search-input'
import { FilterSelect } from '@/components/admin/filter-select'
import { ExportCSVButton } from '@/components/admin/export-csv-button'
import { formatPrice } from '@/lib/utils'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { OrderStatus, PaymentStatus } from '@prisma/client'

/**
 * 📦 Admin Orders List Page
 */

export const metadata = {
  title: 'Gestion Commandes - Admin WatchBiz',
  description: 'Liste des commandes'
}

interface AdminOrdersPageProps {
  searchParams: Promise<{
    search?: string
    status?: OrderStatus
    paymentStatus?: PaymentStatus
  }>
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams

  // Fetch orders with filters
  const ordersResult = await getAdminOrders({
    search: params.search,
    status: params.status,
    paymentStatus: params.paymentStatus
  })

  if (!ordersResult.success || !ordersResult.data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Erreur de chargement</h3>
        <p>{ordersResult.error || 'Impossible de charger les commandes'}</p>
      </div>
    )
  }

  const orders = ordersResult.data

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'REFUNDED':
        return 'bg-slate-100 text-slate-800 border-slate-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
            Commandes
          </h1>
          <p className="text-slate-mid">
            {orders.length} commande{orders.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <ExportCSVButton />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <SearchInput
              placeholder="Rechercher par N° commande ou client..."
              defaultValue={params.search}
            />
          </div>

          {/* Order Status Filter */}
          <FilterSelect
            name="status"
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'PENDING', label: 'En attente' },
              { value: 'PROCESSING', label: 'En traitement' },
              { value: 'SHIPPED', label: 'Expédiée' },
              { value: 'DELIVERED', label: 'Livrée' },
              { value: 'CANCELLED', label: 'Annulée' }
            ]}
            placeholder="Statut commande"
            defaultValue={params.status}
          />

          {/* Payment Status Filter */}
          <FilterSelect
            name="paymentStatus"
            options={[
              { value: '', label: 'Tous les paiements' },
              { value: 'PENDING', label: 'En attente' },
              { value: 'PAID', label: 'Payé' },
              { value: 'FAILED', label: 'Échec' },
              { value: 'REFUNDED', label: 'Remboursé' }
            ]}
            placeholder="Statut paiement"
            defaultValue={params.paymentStatus}
          />
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-slate-mid mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
            Aucune commande
          </h3>
          <p className="text-slate-mid">
            Les commandes apparaîtront ici dès qu'un client en passera une
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-light/50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    N° Commande
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Client
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Date
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Montant
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Paiement
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Statut
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Articles
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Suivi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-light/30">
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-semibold text-gold-champagne hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-luxury-black">
                          {order.user.name || 'Utilisateur'}
                        </p>
                        <p className="text-xs text-slate-mid">{order.user.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-mid">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 font-semibold text-luxury-black">
                      {formatPrice(order.total)}
                    </td>
                    <td className="p-4">
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-mid">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="p-4 text-sm">
                      {order.trackingNumber ? (
                        <span className="text-green-700 font-medium">✓</span>
                      ) : (
                        <span className="text-slate-mid">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
