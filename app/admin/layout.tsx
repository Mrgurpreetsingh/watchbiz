import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

/**
 * 👨‍💼 Admin Layout
 *
 * Layout pour toutes les pages admin avec sidebar et header
 * La protection est assurée par le middleware mais on vérifie quand même
 */

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Double-check auth (au cas où middleware désactivé)
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-light">
      {/* Admin Header */}
      <AdminHeader user={session.user} />

      <div className="flex">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 ml-0 lg:ml-64">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
