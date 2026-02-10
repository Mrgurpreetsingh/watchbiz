import { getAdminOrderById } from '@/actions/admin-orders'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { ArrowLeft, User, MapPin, Package, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { OrderStatusUpdater } from '@/components/admin/order-status-updater'

/**
 * 📦 Admin Order Detail Page
 */

export const metadata = {
  title: 'Détail Commande - Admin WatchBiz',
  description: 'Détails de la commande'
}

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params

  const orderResult = await getAdminOrderById(id)

  if (!orderResult.success || !orderResult.data) {
    notFound()
  }

  const order = orderResult.data

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
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-slate-light rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex-1">
          <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
            Commande {order.orderNumber}
          </h1>
          <p className="text-slate-mid">
            Passée le{' '}
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        <div className="flex gap-3">
          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
            Paiement: {order.paymentStatus}
          </Badge>
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="h-5 w-5 text-gold-champagne" />
              <h2 className="font-heading text-xl font-bold text-luxury-black">
                Client
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {order.user.image ? (
                <img
                  src={order.user.image}
                  alt={order.user.name || 'User'}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gold-champagne/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-gold-champagne" />
                </div>
              )}

              <div>
                <p className="font-semibold text-luxury-black text-lg">
                  {order.user.name || 'Utilisateur'}
                </p>
                <p className="text-slate-mid">{order.user.email}</p>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-5 w-5 text-gold-champagne" />
                <h2 className="font-heading text-xl font-bold text-luxury-black">
                  Adresse de livraison
                </h2>
              </div>

              <div className="text-slate-mid">
                <p className="font-semibold text-luxury-black">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p className="mt-2">{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                </p>
                <p>{order.shippingAddress.state}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </Card>
          )}

          {/* Items */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-5 w-5 text-gold-champagne" />
              <h2 className="font-heading text-xl font-bold text-luxury-black">
                Articles ({order.items.length})
              </h2>
            </div>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-20 w-20 object-cover rounded"
                  />

                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product.slug}`}
                      target="_blank"
                      className="font-semibold text-luxury-black hover:text-gold-champagne"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-slate-mid mt-1">
                      Quantité: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-luxury-black">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-slate-mid">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Status Updater */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-gold-champagne" />
              <h2 className="font-heading text-xl font-bold text-luxury-black">
                Statut de la commande
              </h2>
            </div>

            <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
          </Card>

          {/* Payment Info */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="h-5 w-5 text-gold-champagne" />
              <h2 className="font-heading text-xl font-bold text-luxury-black">
                Paiement
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-mid">Sous-total</span>
                <span className="font-medium text-luxury-black">
                  {formatPrice(order.subtotal)}
                </span>
              </div>

              {order.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-mid">Livraison</span>
                  <span className="font-medium text-luxury-black">
                    {formatPrice(order.shipping)}
                  </span>
                </div>
              )}

              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-mid">TVA (20%)</span>
                  <span className="font-medium text-luxury-black">
                    {formatPrice(order.tax)}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-3 border-t">
                <span className="font-semibold text-luxury-black">Total</span>
                <span className="font-bold text-xl text-gold-champagne">
                  {formatPrice(order.total)}
                </span>
              </div>

              <div className="pt-3 border-t">
                <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                  {order.paymentStatus === 'PAID' && 'Payé'}
                  {order.paymentStatus === 'PENDING' && 'En attente'}
                  {order.paymentStatus === 'FAILED' && 'Échec'}
                  {order.paymentStatus === 'REFUNDED' && 'Remboursé'}
                </Badge>

                {order.stripePaymentId && (
                  <p className="text-xs text-slate-mid mt-2">
                    ID Stripe: {order.stripePaymentId}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
