import { notFound } from 'next/navigation'
import { BrandForm } from '@/components/admin/brand-form'
import { getBrand } from '@/actions/admin-brands'

/**
 * 🏷️ Admin Edit Brand Page
 */

export const metadata = {
  title: 'Modifier Marque - Admin WatchBiz',
  description: 'Modifier une marque'
}

interface AdminEditBrandPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminEditBrandPage({ params }: AdminEditBrandPageProps) {
  const { id } = await params

  // Fetch brand
  const result = await getBrand(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const brand = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
          Modifier Marque
        </h1>
        <p className="text-slate-mid">Modifier les informations de la marque</p>
      </div>

      {/* Form */}
      <BrandForm brand={brand} mode="edit" />
    </div>
  )
}
