import { notFound } from 'next/navigation'
import { CategoryForm } from '@/components/admin/category-form'
import { getCategory } from '@/actions/admin-categories'

/**
 * 📁 Admin Edit Category Page
 */

export const metadata = {
  title: 'Modifier Catégorie - Admin WatchBiz',
  description: 'Modifier une catégorie'
}

interface AdminEditCategoryPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminEditCategoryPage({ params }: AdminEditCategoryPageProps) {
  const { id } = await params

  // Fetch category
  const result = await getCategory(id)

  if (!result.success || !result.data) {
    notFound()
  }

  const category = result.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
          Modifier Catégorie
        </h1>
        <p className="text-slate-mid">Modifier les informations de la catégorie</p>
      </div>

      {/* Form */}
      <CategoryForm category={category} mode="edit" />
    </div>
  )
}
