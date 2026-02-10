'use client'

/**
 * 👤 Menu Utilisateur
 *
 * Client Component : Nécessite 'use client' pour :
 * - useState (gestion de l'ouverture du menu)
 * - signOut (fonction NextAuth côté client)
 * - useRouter (redirection après déconnexion)
 */

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { User, LogOut, ShoppingBag, Settings } from 'lucide-react'

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  /**
   * Déconnexion
   *
   * Appelle NextAuth signOut et redirige vers la page d'accueil
   */
  async function handleSignOut() {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-slate-700 dark:text-slate-300">
          {user.name || 'Utilisateur'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 py-1">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {user.name || 'Utilisateur'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-900 dark:bg-slate-700 text-white mt-1">
                Admin
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              href="/dashboard"
              className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4 mr-3" />
              Mon compte
            </Link>

            <Link
              href="/orders"
              className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="w-4 h-4 mr-3" />
              Mes commandes
            </Link>

            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 mr-3" />
                Administration
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-slate-200 dark:border-slate-700 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
