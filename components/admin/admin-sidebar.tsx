'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Grid,
  Tag,
  Users,
  Settings
} from 'lucide-react'

/**
 * 📋 Admin Sidebar
 *
 * Navigation sidebar pour l'admin dashboard
 */

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Vue d\'ensemble et statistiques'
  },
  {
    name: 'Produits',
    href: '/admin/products',
    icon: Package,
    description: 'Gérer les produits'
  },
  {
    name: 'Commandes',
    href: '/admin/orders',
    icon: ShoppingBag,
    description: 'Gérer les commandes'
  },
  {
    name: 'Catégories',
    href: '/admin/categories',
    icon: Grid,
    description: 'Gérer les catégories'
  },
  {
    name: 'Marques',
    href: '/admin/brands',
    icon: Tag,
    description: 'Gérer les marques'
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
    description: 'Gérer les utilisateurs'
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:border-r lg:bg-white lg:pt-20">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === item.href
                  : pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-gold-champagne/10 text-luxury-black'
                      : 'text-slate-mid hover:bg-slate-light hover:text-luxury-black'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-5 w-5',
                      isActive ? 'text-gold-champagne' : 'text-slate-mid group-hover:text-luxury-black'
                    )}
                  />
                  <div>
                    <p className={cn('font-semibold', isActive && 'text-luxury-black')}>
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-mid">{item.description}</p>
                  </div>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <p className="text-xs text-slate-mid text-center">
            WatchBiz Admin Dashboard
          </p>
        </div>
      </aside>

      {/* Mobile Sidebar (TODO: Add mobile menu with Sheet) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50">
        {navigation.slice(0, 4).map((item) => {
          const isActive = item.href === '/admin' ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium',
                isActive
                  ? 'text-gold-champagne'
                  : 'text-slate-mid hover:text-luxury-black'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>
    </>
  )
}
