'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordReset } from '@/actions/auth-reset'
import { Loader2, Mail, CheckCircle } from 'lucide-react'

/**
 * 📧 Formulaire Mot de Passe Oublié
 *
 * Permet de demander un email de réinitialisation
 */
export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string

    startTransition(async () => {
      const result = await requestPasswordReset(email)

      if (result.success) {
        setSuccess(true)
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
          Email envoyé !
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          Si un compte existe avec cette adresse email, vous recevrez un lien pour réinitialiser votre mot de passe dans quelques minutes.
        </p>
        <p className="text-slate-500 text-xs mt-4">
          Pensez à vérifier vos spams si vous ne recevez rien.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email */}
      <div>
        <Label htmlFor="email">Adresse email</Label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="votre@email.com"
            required
            disabled={isPending}
            className="pl-10"
          />
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
            Envoi en cours...
          </>
        ) : (
          <>
            <Mail className="mr-2 h-5 w-5" />
            Envoyer le lien de réinitialisation
          </>
        )}
      </Button>
    </form>
  )
}
