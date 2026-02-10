import { BrandForm } from '@/components/admin/brand-form'

/**
 * 🏷️ Admin New Brand Page
 */

export const metadata = {
  title: 'Nouvelle Marque - Admin WatchBiz',
  description: 'Créer une nouvelle marque'
}

export default function AdminNewBrandPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
          Nouvelle Marque
        </h1>
        <p className="text-slate-mid">Créer une nouvelle marque de montres</p>
      </div>

      {/* Form */}
      <BrandForm mode="create" />
    </div>
  )
}
