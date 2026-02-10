import { getAdminProducts } from '@/actions/admin-products'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/admin/search-input'
import { FilterSelect } from '@/components/admin/filter-select'
import { formatPrice } from '@/lib/utils'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import Link from 'next/link'
import { DeleteProductButton } from '@/components/admin/delete-product-button'
import prisma from '@/lib/prisma'

/**
 * 📦 Admin Products List Page
 */

export const metadata = {
  title: 'Gestion Produits - Admin WatchBiz',
  description: 'Liste des produits'
}

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string
    categoryId?: string
    brandId?: string
    isActive?: string
    lowStock?: string
  }>
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams

  // Fetch products with filters
  const productsResult = await getAdminProducts({
    search: params.search,
    categoryId: params.categoryId,
    brandId: params.brandId,
    isActive: params.isActive,
    lowStock: params.lowStock === 'true'
  })

  if (!productsResult.success || !productsResult.data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Erreur de chargement</h3>
        <p>{productsResult.error || 'Impossible de charger les produits'}</p>
      </div>
    )
  }

  const products = productsResult.data

  // Fetch categories and brands for filters
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  const brands = await prisma.brand.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
            Produits
          </h1>
          <p className="text-slate-mid">
            {products.length} produit{products.length > 1 ? 's' : ''} au total
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="lg:col-span-2">
            <SearchInput
              placeholder="Rechercher par nom ou SKU..."
              defaultValue={params.search}
            />
          </div>

          {/* Category Filter */}
          <FilterSelect
            name="categoryId"
            options={[
              { value: '', label: 'Toutes les catégories' },
              ...categories.map((cat) => ({
                value: cat.id,
                label: cat.name
              }))
            ]}
            placeholder="Catégorie"
            defaultValue={params.categoryId}
          />

          {/* Brand Filter */}
          <FilterSelect
            name="brandId"
            options={[
              { value: '', label: 'Toutes les marques' },
              ...brands.map((brand) => ({
                value: brand.id,
                label: brand.name
              }))
            ]}
            placeholder="Marque"
            defaultValue={params.brandId}
          />

          {/* Active/Inactive Filter */}
          <FilterSelect
            name="isActive"
            options={[
              { value: '', label: 'Tous les statuts' },
              { value: 'true', label: 'Actifs' },
              { value: 'false', label: 'Inactifs' }
            ]}
            placeholder="Statut"
            defaultValue={params.isActive}
          />
        </div>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Package className="h-16 w-16 text-slate-mid mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
            Aucun produit
          </h3>
          <p className="text-slate-mid mb-6">
            Commencez par ajouter votre premier produit
          </p>
          <Button asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-light/50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Produit
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Catégorie
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Marque
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Prix
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Stock
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Statut
                  </th>
                  <th className="text-right p-4 text-sm font-semibold text-luxury-black">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-light/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                        />
                        <div>
                          <p className="font-semibold text-luxury-black">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-mid">
                            SKU: {product.sku || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-mid">
                      {product.category.name}
                    </td>
                    <td className="p-4 text-sm text-slate-mid">
                      {product.brand.name}
                    </td>
                    <td className="p-4 text-sm font-semibold text-luxury-black">
                      {formatPrice(product.price)}
                    </td>
                    <td className="p-4">
                      <Badge
                        className={
                          product.stock > 10
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }
                      >
                        {product.stock} unités
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={
                          product.isActive
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }
                      >
                        {product.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                        />
                      </div>
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
