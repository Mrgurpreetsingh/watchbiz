import { getCategoriesAndBrands } from '@/actions/admin-products'
import { ProductForm } from '@/components/admin/product-form'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/**
 * ✏️ Edit Product Page
 */

export const metadata = {
  title: 'Modifier Produit - Admin WatchBiz',
  description: 'Modifier un produit existant'
}

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params

  // Fetch product
  const product = await prisma.product.findUnique({
    where: { id }
  })

  if (!product) {
    notFound()
  }

  // Fetch categories and brands
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
            Modifier le produit
          </h1>
          <p className="text-slate-mid">{product.name}</p>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        product={product}
        categories={categories}
        brands={brands}
        mode="edit"
      />
    </div>
  )
}
