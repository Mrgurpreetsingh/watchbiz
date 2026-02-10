'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Watch, Tag, Info, User, LogIn, ShoppingBag } from 'lucide-react';
import { User as UserType } from 'next-auth';

interface MobileNavProps {
  user: UserType | undefined;
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Fermer le menu lors du changement de page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock/unlock scroll quand le menu est ouvert/fermé
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Bouton Hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
        aria-label="Ouvrir le menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 z-[70] md:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header du menu */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xl font-bold text-slate-900 dark:text-white font-heading">
              WatchBiz
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
              aria-label="Fermer le menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6">
            <div className="space-y-1 px-4">
              {/* Montres */}
              <Link
                href="/products"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/products')
                    ? 'bg-gold-champagne/10 text-gold-champagne font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Watch className="w-5 h-5" />
                <span>Montres</span>
              </Link>

              {/* Marques */}
              <Link
                href="/brands"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/brands')
                    ? 'bg-gold-champagne/10 text-gold-champagne font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Tag className="w-5 h-5" />
                <span>Marques</span>
              </Link>

              {/* À propos */}
              <Link
                href="/about"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/about')
                    ? 'bg-gold-champagne/10 text-gold-champagne font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Info className="w-5 h-5" />
                <span>À propos</span>
              </Link>

              {/* Contact */}
              <Link
                href="/contact"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive('/contact')
                    ? 'bg-gold-champagne/10 text-gold-champagne font-medium'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Info className="w-5 h-5" />
                <span>Contact</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-slate-200 dark:border-slate-800" />

            {/* User Menu */}
            <div className="space-y-1 px-4">
              {user ? (
                <>
                  {/* User Info */}
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gold-champagne/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gold-champagne" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {user.name || user.email}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Links */}
                  <Link
                    href="/account"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>Mon compte</span>
                  </Link>

                  <Link
                    href="/account/orders"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span>Mes commandes</span>
                  </Link>

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                      <span>Administration</span>
                    </Link>
                  )}

                  <form action="/api/auth/signout" method="POST" className="mt-4">
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Déconnexion
                    </button>
                  </form>
                </>
              ) : (
                <>
                  {/* Login Button */}
                  <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Connexion</span>
                  </Link>

                  {/* Register Button */}
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-gold-champagne to-gold-dark text-luxury-black hover:shadow-lg transition-all font-medium"
                  >
                    <User className="w-5 h-5" />
                    <span>S'inscrire</span>
                  </Link>
                </>
              )}
            </div>
          </nav>

          {/* Footer du menu */}
          <div className="border-t border-slate-200 dark:border-slate-800 p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              © 2024 WatchBiz. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
