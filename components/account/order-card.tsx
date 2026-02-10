import Link from 'next/link'
import { Order, OrderItem, Product, Address } from '@prisma/client'
import { Package, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Pick<Product, 'name' | 'slug' | 'images'> | null
  })[]
  shippingAddress: Address | null
}

interface OrderCardProps {
  order: OrderWithItems
}

/**
 * 📦 Order Card
 *
 * Carte résumé commande pour la liste
 */
export function OrderCard({ order }: OrderCardProps) {
  // Status colors
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
    switch (status) {
      case 'PENDING':
        return 'En attente'
      case 'PROCESSING':
        return 'En préparation'
      case 'SHIPPED':
        return 'Expédiée'
      case 'DELIVERED':
        return 'Livrée'
      case 'CANCELLED':
        return 'Annulée'
      default:
        return status
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
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Payée'
      case 'PENDING':
        return 'En attente'
      case 'FAILED':
        return 'Échouée'
      case 'REFUNDED':
        return 'Remboursée'
      default:
        return status
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-5 w-5 text-gold-champagne" />
            <h3 className="font-accent text-lg font-bold text-luxury-black">
              {order.orderNumber}
            </h3>
          </div>
          <p className="text-sm text-slate-mid">
            Commandé le{' '}
            {new Date(order.createdAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <Badge className={getStatusColor(order.status)}>
            {getStatusLabel(order.status)}
          </Badge>
          <Badge className={getPaymentStatusColor(order.paymentStatus)}>
            {getPaymentStatusLabel(order.paymentStatus)}
          </Badge>
        </div>
      </div>

      {/* Items Preview (max 3) */}
      <div className="space-y-2 mb-4">
        {order.items.slice(0, 3).map((item) => (
          <div key={item.id} className="flex items-center gap-3 text-sm">
            {/* Image */}
            {item.product?.images?.[0] ? (
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="h-12 w-12 object-cover rounded"
              />
            ) : (
              <div className="h-12 w-12 bg-slate-light rounded flex items-center justify-center">
                <Package className="h-6 w-6 text-slate-mid" />
              </div>
            )}

            {/* Name */}
            <div className="flex-1">
              <p className="font-medium text-luxury-black">
                {item.product?.name || 'Produit supprimé'}
              </p>
              <p className="text-xs text-slate-mid">Quantité : {item.quantity}</p>
            </div>

            {/* Price */}
            <p className="font-semibold text-luxury-black">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}

        {order.items.length > 3 && (
          <p className="text-xs text-slate-mid">
            + {order.items.length - 3} autre(s) article(s)
          </p>
        )}
      </div>

      {/* Address Preview */}
      {order.shippingAddress && (
        <div className="bg-slate-light/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-slate-mid flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-luxury-black">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-slate-mid text-xs">
                {order.shippingAddress.street}, {order.shippingAddress.postalCode}{' '}
                {order.shippingAddress.city}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          <p className="text-sm text-slate-mid">Total</p>
          <p className="font-accent text-2xl font-bold text-luxury-black">
            {formatPrice(order.total)}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/account/orders/${order.id}`}>
            Voir les détails
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
