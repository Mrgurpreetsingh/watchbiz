import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import { getWishlist } from '@/actions/wishlist'
import { formatPrice } from '@/lib/utils'
import { WishlistButton } from '@/components/wishlist/wishlist-button'
import { Heart, ShoppingCart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ma Wishlist - WatchBiz',
  description: 'Votre liste de souhaits de montres de luxe',
}

export default async function WishlistPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/wishlist')
  }

  const result = await getWishlist()

  if (!result.success || !result.data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Erreur lors du chargement de la wishlist.</p>
      </div>
    )
  }

  const wishlist = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-luxury-black mb-2">
            Ma Wishlist 💝
          </h1>
          <p className="text-slate-600">
            {wishlist.length > 0
              ? `${wishlist.length} montre${wishlist.length > 1 ? 's' : ''} dans votre liste de souhaits`
              : 'Votre liste de souhaits est vide'}
          </p>
        </div>
      </div>

      {/* Wishlist Items */}
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Remove Button */}
              <div className="absolute top-3 right-3 z-10">
                <WishlistButton productId={item.productId} variant="compact" />
              </div>

              {/* Product Link */}
              <Link href={`/products/${item.product.slug}`} className="block">
                {/* Image */}
                <div className="relative aspect-square bg-slate-light overflow-hidden">
                  <Image
                    src={item.product.images[0] || '/images/placeholder-watch.jpg'}
                    alt={item.product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Brand */}
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-mid mb-1">
                    {item.product.brand.name}
                  </p>

                  {/* Name */}
                  <h3 className="font-heading text-lg font-semibold leading-tight text-luxury-black mb-2 line-clamp-2">
                    {item.product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-3">
                    <div className="font-accent text-xl font-semibold text-luxury-black">
                      {formatPrice(item.product.price)}
                    </div>
                    {item.product.compareAtPrice && item.product.compareAtPrice > 0 && (
                      <div className="text-sm text-slate-mid line-through">
                        {formatPrice(item.product.compareAtPrice)}
                      </div>
                    )}
                  </div>

                  {/* Stock Status */}
                  {item.product.quantity > 0 ? (
                    <p className="text-sm text-emerald-green font-medium">En stock</p>
                  ) : (
                    <p className="text-sm text-ruby-red font-medium">Rupture de stock</p>
                  )}
                </div>
              </Link>

              {/* Add to Cart Button */}
              <div className="p-4 pt-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-champagne to-gold-dark text-luxury-black rounded-lg font-semibold hover:shadow-md transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Voir le produit</span>
                </Link>
              </div>

              {/* Added Date */}
              <div className="px-4 pb-3">
                <p className="text-xs text-slate-mid">
                  Ajouté le{' '}
                  {new Date(item.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-slate-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-slate-mid" />
          </div>
          <h3 className="font-heading text-2xl font-bold text-luxury-black mb-2">
            Votre wishlist est vide
          </h3>
          <p className="text-slate-600 mb-6 max-w-md mx-auto">
            Parcourez notre collection exclusive de montres de luxe et ajoutez vos coups de cœur à
            votre liste de souhaits
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-gradient-to-r from-gold-champagne to-gold-dark text-luxury-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Découvrir la Collection
          </Link>
        </div>
      )}

      {/* Tips */}
      {wishlist.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Astuce</h4>
          <p className="text-sm text-blue-800">
            Les produits de votre wishlist peuvent être en rupture de stock ou voir leur prix
            changer. Nous vous recommandons de les ajouter rapidement au panier pour ne pas les
            manquer !
          </p>
        </div>
      )}
    </div>
  )
}
