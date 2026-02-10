import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Badge } from '@/components/ui/badge'
import { UserActionsMenu } from '@/components/admin/user-actions-menu'
import { User, ShieldCheck, Ban, CheckCircle } from 'lucide-react'

/**
 * 👥 Admin Users Page
 */

export const metadata = {
  title: 'Gestion Utilisateurs - Admin WatchBiz',
  description: 'Liste des utilisateurs'
}

export default async function AdminUsersPage() {
  // Get current session
  const session = await auth()
  const currentUserId = session?.user?.id

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          orders: true,
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const getRoleColor = (role: string) => {
    return role === 'ADMIN'
      ? 'bg-gold-champagne/20 text-gold-champagne border-gold-champagne'
      : 'bg-blue-100 text-blue-800 border-blue-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
          Utilisateurs
        </h1>
        <p className="text-slate-mid">
          {users.length} utilisateur{users.length > 1 ? 's' : ''} enregistré{users.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <User className="h-16 w-16 text-slate-mid mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-luxury-black mb-2">
            Aucun utilisateur
          </h3>
          <p className="text-slate-mid">Les utilisateurs apparaîtront ici</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-light/50 border-b">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Utilisateur
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Email
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Rôle
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Statut
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Commandes
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Avis
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Inscription
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-luxury-black">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-light/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || 'User'}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-slate-light flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-mid" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-luxury-black">
                            {user.name || 'Utilisateur'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-mid">{user.email}</td>
                    <td className="p-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role === 'ADMIN' && (
                          <ShieldCheck className="h-3 w-3 mr-1" />
                        )}
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge
                        className={
                          user.isBlocked
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-green-100 text-green-800 border-green-200'
                        }
                      >
                        {user.isBlocked ? (
                          <>
                            <Ban className="h-3 w-3 mr-1" />
                            Bloqué
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Actif
                          </>
                        )}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-mid">
                      {user._count.orders}
                    </td>
                    <td className="p-4 text-sm text-slate-mid">
                      {user._count.reviews}
                    </td>
                    <td className="p-4 text-sm text-slate-mid">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <UserActionsMenu
                        userId={user.id}
                        userName={user.name || user.email}
                        currentRole={user.role}
                        isBlocked={user.isBlocked}
                        isCurrentUser={user.id === currentUserId}
                      />
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
