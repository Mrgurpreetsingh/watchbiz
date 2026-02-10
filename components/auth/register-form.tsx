'use client'

/**
 * 📝 Formulaire d'Inscription
 *
 * Client Component : Nécessite 'use client' pour :
 * - useState (gestion du formulaire)
 * - useRouter (redirection après inscription)
 * - useFormState (gestion de l'état du formulaire avec Server Actions)
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { registerUser } from '@/actions/auth'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Soumission du formulaire
   *
   * 1. Appelle la Server Action registerUser
   * 2. Si succès : connecte automatiquement l'utilisateur
   * 3. Redirige vers la page d'accueil
   */
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)

    try {
      // 1. Créer le compte via Server Action
      const result = await registerUser(formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // 2. Connecter automatiquement l'utilisateur
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        // Inscription OK mais connexion échouée : rediriger vers login
        router.push('/login?registered=true')
        return
      }

      // 3. Inscription et connexion réussies : rediriger vers l'accueil
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Register error:', error)
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

      {/* Nom */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Nom complet
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          placeholder="Jean Dupont"
        />
      </div>

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
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          placeholder="••••••••"
        />
        <p className="mt-1 text-xs text-slate-500">
          Au moins 8 caractères
        </p>
      </div>

      {/* Terms */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded"
          />
        </div>
        <div className="ml-2 text-sm">
          <label htmlFor="terms" className="text-slate-700">
            J'accepte les{' '}
            <a href="#" className="font-medium text-slate-900 hover:underline">
              conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="#" className="font-medium text-slate-900 hover:underline">
              politique de confidentialité
            </a>
          </label>
        </div>
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Création du compte...' : 'Créer un compte'}
      </button>
    </form>
  )
}
