'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/actions/auth-reset'
import { Loader2, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react'

interface ResetPasswordFormProps {
  token: string
}

/**
 * 🔐 Formulaire Réinitialisation Mot de Passe
 *
 * Permet de définir un nouveau mot de passe
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    startTransition(async () => {
      const result = await resetPassword(token, password)

      if (result.success) {
        setSuccess(true)
        // Rediriger vers login après 2 secondes
        setTimeout(() => {
          router.push('/login?reset=success')
        }, 2000)
      } else {
        setError(result.error || 'Une erreur est survenue')
      }
    })
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Mot de passe changé !
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm">
          Vous allez être redirigé vers la page de connexion...
        </p>
        <div className="mt-4">
          <Loader2 className="w-6 h-6 text-gold-champagne animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nouveau mot de passe */}
      <div>
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            required
            minLength={8}
            disabled={isPending}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">Au moins 8 caractères</p>
      </div>

      {/* Confirmer mot de passe */}
      <div>
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <div className="relative mt-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            required
            minLength={8}
            disabled={isPending}
            className="pl-10 pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        className="w-full bg-gradient-to-r from-gold-champagne to-gold-dark hover:from-gold-champagne/90 hover:to-gold-dark/90 text-luxury-black"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Changement en cours...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Changer le mot de passe
          </>
        )}
      </Button>
    </form>
  )
}
