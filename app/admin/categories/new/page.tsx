import { CategoryForm } from '@/components/admin/category-form'

/**
 * 📁 Admin New Category Page
 */

export const metadata = {
  title: 'Nouvelle Catégorie - Admin WatchBiz',
  description: 'Créer une nouvelle catégorie'
}

export default function AdminNewCategoryPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
          Nouvelle Catégorie
        </h1>
        <p className="text-slate-mid">Créer une nouvelle catégorie de produits</p>
      </div>

      {/* Form */}
      <CategoryForm mode="create" />
    </div>
  )
}
