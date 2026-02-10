import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteBrandButton } from '@/components/admin/delete-brand-button'
import { Plus, Pencil, Tag } from 'lucide-react'
import Link from 'next/link'

/**
 * 🏷️ Admin Brands Page
 */

export const metadata = {
  title: 'Gestion Marques - Admin WatchBiz',
  description: 'Liste des marques'
}

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
            Marques
          </h1>
          <p className="text-slate-mid">
            {brands.length} marque{brands.length > 1 ? 's' : ''}
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/brands/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une marque
          </Link>
        </Button>
      </div>

      {/* Brands Grid */}
      {brands.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Tag className="h-16 w-16 text-slate-mid mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
            Aucune marque
          </h3>
          <p className="text-slate-mid">Ajoutez votre première marque</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow text-center"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-20 w-20 object-contain mx-auto mb-4"
                />
              ) : (
                <div className="h-20 w-20 bg-slate-light rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Tag className="h-8 w-8 text-slate-mid" />
                </div>
              )}

              <h3 className="font-heading text-lg font-bold text-luxury-black mb-3">
                {brand.name}
              </h3>

              <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4">
                {brand._count.products} produits
              </Badge>

              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/brands/${brand.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <DeleteBrandButton
                  brandId={brand.id}
                  brandName={brand.name}
                  productCount={brand._count.products}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
