/**
 * 🎯 Header du site
 *
 * Server Component : Utilise auth() pour récupérer la session
 * Affiche différents menus selon l'état d'authentification
 */

import Link from 'next/link'
import { auth } from '@/lib/auth'
import { UserMenu } from './user-menu'
import { MobileNav } from './mobile-nav'
import { CartButton } from '@/components/cart/cart-button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Search, User } from 'lucide-react'

export async function Header() {
  // Récupérer la session côté serveur
  const session = await auth()

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">
                WatchBiz
              </span>
            </Link>

            {/* Navigation principale */}
            <nav className="hidden md:flex ml-10 space-x-8">
              <Link
                href="/products"
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium"
              >
                Montres
              </Link>
              <Link
                href="/brands"
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium"
              >
                Marques
              </Link>
              <Link
                href="/about"
                className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium"
              >
                À propos
              </Link>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Recherche - caché sur mobile */}
            <button className="hidden sm:block p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
              <Search className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle variant="compact" />

            {/* Panier */}
            <CartButton />

            {/* Menu utilisateur ou boutons de connexion - caché sur mobile */}
            <div className="hidden md:flex items-center space-x-3">
              {session ? (
                // Utilisateur connecté : afficher le menu
                <UserMenu user={session.user} />
              ) : (
                // Utilisateur non connecté : boutons de connexion/inscription
                <>
                  <Link
                    href="/login"
                    className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600"
                  >
                    S'inscrire
                  </Link>
                </>
              )}
            </div>

            {/* Menu Burger Mobile */}
            <MobileNav user={session?.user} />
          </div>
        </div>
      </div>

    </header>
  )
}
