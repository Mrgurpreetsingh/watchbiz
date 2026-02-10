'use client'

import Link from 'next/link'
import { User } from 'next-auth'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'
import { LogOut, User as UserIcon, Eye, Bell } from 'lucide-react'

/**
 * 🎩 Admin Header
 *
 * Header fixe pour l'admin dashboard avec user menu
 */

interface AdminHeaderProps {
  user: User
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link
          href="/admin"
          className="flex items-center gap-3 font-heading text-2xl font-bold text-luxury-black"
        >
          ⌚ <span>WatchBiz</span>
          <span className="text-xs font-body text-gold-champagne bg-gold-champagne/10 px-2 py-1 rounded">
            ADMIN
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* View Site Button */}
          <Button asChild variant="outline" size="sm">
            <Link href="/" target="_blank">
              <Eye className="h-4 w-4 mr-2" />
              Voir le site
            </Link>
          </Button>

          {/* Notifications (placeholder) */}
          <button className="relative p-2 text-slate-mid hover:text-luxury-black transition-colors rounded-lg hover:bg-slate-light">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-light transition-colors">
                <div className="h-8 w-8 rounded-full bg-gold-champagne/20 flex items-center justify-center">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name || 'Admin'}
                      className="h-full w-full object-cover rounded-full"
                    />
                  ) : (
                    <UserIcon className="h-4 w-4 text-gold-champagne" />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-luxury-black">
                    {user.name || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-mid">Administrateur</p>
                </div>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/account" className="cursor-pointer">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Mon profil
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  fetch('/api/auth/signout', { method: 'POST' }).then(() => {
                    window.location.href = '/login'
                  })
                }}
                destructive
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
