import prisma from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DeleteCategoryButton } from '@/components/admin/delete-category-button'
import { Plus, Pencil, Grid } from 'lucide-react'
import Link from 'next/link'

/**
 * 📁 Admin Categories Page
 */

export const metadata = {
  title: 'Gestion Catégories - Admin WatchBiz',
  description: 'Liste des catégories'
}

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
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
            Catégories
          </h1>
          <p className="text-slate-mid">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''}
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une catégorie
          </Link>
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Grid className="h-16 w-16 text-slate-mid mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
            Aucune catégorie
          </h3>
          <p className="text-slate-mid">Ajoutez votre première catégorie</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
            >
              {category.image && (
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-40 w-full object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
                {category.name}
              </h3>

              {category.description && (
                <p className="text-sm text-slate-mid mb-4 line-clamp-2">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {category._count.products} produits
                </Badge>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/categories/${category.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <DeleteCategoryButton
                    categoryId={category.id}
                    categoryName={category.name}
                    productCount={category._count.products}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
