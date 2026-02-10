import { getCategoriesAndBrands } from '@/actions/admin-products'
import { ProductForm } from '@/components/admin/product-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/**
 * ➕ Create Product Page
 */

export const metadata = {
  title: 'Nouveau Produit - Admin WatchBiz',
  description: 'Créer un nouveau produit'
}

export default async function CreateProductPage() {
  const result = await getCategoriesAndBrands()

  if (!result.success || !result.data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-6">
        <h3 className="font-semibold mb-2">Erreur de chargement</h3>
        <p>{result.error || 'Impossible de charger les données'}</p>
      </div>
    )
  }

  const { categories, brands } = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-slate-light rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
            Nouveau produit
          </h1>
          <p className="text-slate-mid">
            Ajoutez un nouveau produit à votre catalogue
          </p>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        categories={categories}
        brands={brands}
        mode="create"
      />
    </div>
  )
}
