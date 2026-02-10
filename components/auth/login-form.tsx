'use client'

/**
 * 🔐 Formulaire de Connexion
 *
 * Client Component : Nécessite 'use client' pour :
 * - useState (gestion du formulaire)
 * - signIn (fonction NextAuth côté client)
 * - useRouter (redirection après connexion)
 */

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Soumission du formulaire
   *
   * Équivalent de fetch('/api/auth/login', { ... }) dans une app classique
   */
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // Appel à NextAuth signIn
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, // Ne pas rediriger automatiquement
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
        setIsLoading(false)
        return
      }

      // Connexion réussie : rediriger vers la page d'accueil
      router.push('/')
      router.refresh() // Rafraîchir pour mettre à jour la session
    } catch (error) {
      console.error('Login error:', error)
      setError('Une erreur est survenue. Veuillez réessayer.')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          placeholder="vous@exemple.com"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      {/* Remember me & Forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-slate-700"
          >
            Se souvenir de moi
          </label>
        </div>

        <div className="text-sm">
          <a
            href="/forgot-password"
            className="font-medium text-slate-900 dark:text-white hover:text-gold-champagne transition-colors"
          >
            Mot de passe oublié ?
          </a>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
    </form>
  )
}
