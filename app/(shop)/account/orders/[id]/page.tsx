import { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getOrderById } from '@/actions/orders'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  ArrowLeft,
  Calendar
} from 'lucide-react'

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Détail Commande - WatchBiz',
  description: 'Consultez les détails de votre commande : articles, statut de livraison, adresse et paiement.',
  robots: {
    index: false,
    follow: false,
  },
}

/**
 * 📦 Page Détail Commande
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/orders')
  }

  const { id } = await params
  const result = await getOrderById(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const order = result.data

  // Status helpers
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PROCESSING: 'En préparation',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée'
    }
    return labels[status] || status
  }

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PAID: 'Payée',
      PENDING: 'En attente',
      FAILED: 'Échouée',
      REFUNDED: 'Remboursée'
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm">
        <Link href="/account/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux commandes
        </Link>
      </Button>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-6 w-6 text-gold-champagne" />
              <h1 className="font-heading text-3xl font-bold text-luxury-black">
                Commande {order.orderNumber}
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-mid">
              <Calendar className="h-4 w-4" />
              Commandé le{' '}
              {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 items-end">
            <Badge className={getStatusColor(order.status)}>
              {getStatusLabel(order.status)}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="font-heading text-xl font-bold text-luxury-black mb-4">
              Articles commandés ({order.items.length})
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Image */}
                  {item.product?.images?.[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="h-24 w-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-24 w-24 bg-slate-light rounded-lg flex items-center justify-center">
                      <Package className="h-10 w-10 text-slate-mid" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-luxury-black mb-1">
                      {item.product?.name || 'Produit supprimé'}
                    </h3>
                    {item.product?.slug && (
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="text-sm text-gold-champagne hover:underline"
                      >
                        Voir le produit →
                      </Link>
                    )}
                    <p className="text-sm text-slate-mid mt-2">
                      Prix unitaire : {formatPrice(item.price)}
                    </p>
                    <p className="text-sm text-slate-mid">
                      Quantité : {item.quantity}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="font-accent text-xl font-bold text-luxury-black">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-gold-champagne" />
                <h2 className="font-heading text-xl font-bold text-luxury-black">
                  Adresse de livraison
                </h2>
              </div>

              <div className="bg-slate-light/30 rounded-lg p-4">
                <p className="font-semibold text-luxury-black mb-1">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-slate-mid text-sm">
                  {order.shippingAddress.street}
                </p>
                <p className="text-slate-mid text-sm">
                  {order.shippingAddress.postalCode} {order.shippingAddress.city}
                </p>
                <p className="text-slate-mid text-sm">
                  {order.shippingAddress.state}
                </p>
                <p className="text-slate-mid text-sm">
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.phone && (
                  <p className="text-slate-mid text-sm mt-2">
                    📞 {order.shippingAddress.phone}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="font-heading text-xl font-bold text-luxury-black mb-4">
              Récapitulatif
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-mid">Sous-total</span>
                <span className="font-semibold text-luxury-black">
                  {formatPrice(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-mid">Livraison</span>
                <span className="font-semibold text-luxury-black">
                  {order.shipping === 0 ? 'Gratuite' : formatPrice(order.shipping)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-mid">TVA (20%)</span>
                <span className="font-semibold text-luxury-black">
                  {formatPrice(order.tax)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold text-luxury-black">Total</span>
                <span className="font-accent text-2xl font-bold text-gold-champagne">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard className="h-5 w-5 text-slate-mid" />
                <h3 className="font-medium text-luxury-black">Paiement</h3>
              </div>

              <div className="bg-slate-light/30 rounded-lg p-3">
                <p className="text-sm text-slate-mid mb-1">Statut</p>
                <p className="font-semibold text-luxury-black">
                  {getPaymentStatusLabel(order.paymentStatus)}
                </p>
                {order.paymentMethod && (
                  <>
                    <p className="text-sm text-slate-mid mt-3 mb-1">Méthode</p>
                    <p className="font-semibold text-luxury-black capitalize">
                      {order.paymentMethod}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Tracking (if shipped or delivered) */}
            {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium text-luxury-black">Suivi de livraison</h3>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  {order.trackingNumber ? (
                    <>
                      <p className="text-xs text-purple-700 mb-2">Numéro de suivi</p>
                      <p className="font-mono font-semibold text-purple-900 text-sm break-all mb-2">
                        {order.trackingNumber}
                      </p>
                      <p className="text-xs text-purple-700">
                        {order.status === 'SHIPPED'
                          ? '📦 Votre colis est en cours de livraison'
                          : '✅ Votre colis a été livré'}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-purple-800">
                      {order.status === 'SHIPPED'
                        ? '📦 Votre colis est en cours de livraison. Le numéro de suivi sera disponible prochainement.'
                        : '✅ Votre colis a été livré.'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
