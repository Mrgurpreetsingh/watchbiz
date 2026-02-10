import dynamic from 'next/dynamic'
import { getDashboardStats } from '@/actions/admin-stats'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/utils'
import { DollarSign, ShoppingBag, Package, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

// Lazy load du chart (Recharts est lourd)
const RevenueChart = dynamic(
  () => import('@/components/admin/revenue-chart').then(mod => ({ default: mod.RevenueChart })),
  {
    loading: () => <Skeleton className="w-full h-[300px]" />,
  }
)

/**
 * 📊 Admin Dashboard Page
 *
 * Page principale du dashboard admin avec statistiques
 */

export const metadata = {
  title: 'Dashboard Admin - WatchBiz',
  description: 'Tableau de bord administrateur'
}

export default async function AdminDashboardPage() {
  const statsResult = await getDashboardStats()

  if (!statsResult.success || !statsResult.data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Erreur de chargement</h3>
        <p>Impossible de charger les statistiques. Veuillez rafraîchir la page.</p>
      </div>
    )
  }

  const stats = statsResult.data

  const statCards = [
    {
      title: 'Chiffre d\'affaires',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Commandes',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Produits',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers.toString(),
      icon: Users,
      color: 'text-gold-champagne bg-gold-champagne/10'
    }
  ]

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
          Dashboard
        </h1>
        <p className="text-slate-mid">
          Vue d'ensemble de votre boutique en ligne
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-slate-mid">{stat.title}</p>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-luxury-black">{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-luxury-black">
              Commandes récentes
            </h2>
            <Link
              href="/admin/orders"
              className="text-sm text-gold-champagne hover:underline"
            >
              Voir tout
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentOrders.length === 0 ? (
              <p className="text-slate-mid text-center py-8">
                Aucune commande pour le moment
              </p>
            ) : (
              stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 bg-slate-light/50 rounded-lg hover:bg-slate-light transition-colors"
                >
                  <div>
                    <p className="font-semibold text-luxury-black">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-slate-mid">
                      {order.user.name || order.user.email}
                    </p>
                    <p className="text-xs text-slate-mid mt-1">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-luxury-black mb-1">
                      {formatPrice(order.total)}
                    </p>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold text-luxury-black">
              Top produits
            </h2>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>

          <div className="space-y-4">
            {stats.topProducts.length === 0 ? (
              <p className="text-slate-mid text-center py-8">
                Aucune vente pour le moment
              </p>
            ) : (
              stats.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-slate-light/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gold-champagne/20 text-gold-champagne font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-luxury-black">
                        {product.name}
                      </p>
                      <p className="text-sm text-slate-mid">
                        {product.totalSales} ventes
                      </p>
                    </div>
                  </div>

                  <p className="font-semibold text-luxury-black">
                    {formatPrice(product.revenue)}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Monthly Revenue Chart */}
      {stats.monthlyRevenue.length > 0 && (
        <Card className="p-6">
          <h2 className="font-heading text-2xl font-bold text-luxury-black mb-6">
            Chiffre d'affaires (6 derniers mois)
          </h2>

          <RevenueChart data={stats.monthlyRevenue} />
        </Card>
      )}
    </div>
  )
}
