import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { User, Package, MapPin, Lock, LayoutDashboard, Heart } from 'lucide-react'

interface AccountLayoutProps {
  children: ReactNode
}

/**
 * 👤 Layout Espace Utilisateur
 *
 * Layout avec sidebar navigation pour /account/*
 * Protected : Require auth
 */
export default async function AccountLayout({ children }: AccountLayoutProps) {
  // Require auth
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/account')
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/account',
      icon: LayoutDashboard,
      description: 'Vue d\'ensemble'
    },
    {
      name: 'Mon Profil',
      href: '/account/profile',
      icon: User,
      description: 'Informations personnelles'
    },
    {
      name: 'Mes Commandes',
      href: '/account/orders',
      icon: Package,
      description: 'Historique et suivi'
    },
    {
      name: 'Ma Wishlist',
      href: '/account/wishlist',
      icon: Heart,
      description: 'Liste de souhaits'
    },
    {
      name: 'Mes Adresses',
      href: '/account/addresses',
      icon: MapPin,
      description: 'Adresses de livraison'
    },
    {
      name: 'Sécurité',
      href: '/account/security',
      icon: Lock,
      description: 'Mot de passe'
    }
  ]

  return (
    <div className="min-h-screen bg-ivory">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-4xl font-bold text-luxury-black mb-2">
            Mon Compte
          </h1>
          <p className="text-slate-mid">
            Bienvenue, <span className="font-semibold text-luxury-black">{session.user.name || session.user.email}</span>
          </p>
        </div>

        {/* Grid Layout : Sidebar + Content */}
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation (1/4) */}
          <aside className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-md p-4 sticky top-24">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-slate-light/30 group"
                      >
                        <Icon className="h-5 w-5 text-slate-mid group-hover:text-gold-champagne transition-colors flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-luxury-black group-hover:text-gold-champagne transition-colors">
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-mid mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content (3/4) */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
