'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePassword } from '@/actions/profile'
import { Loader2, Lock } from 'lucide-react'

/**
 * 🔐 Formulaire Changement Mot de Passe
 */
export function PasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updatePassword(formData)

      if (result.success) {
        setSuccess(true)
        // Reset form
        e.currentTarget.reset()
        setTimeout(() => setSuccess(false), 5000)
      } else {
        setError(result.error || 'Une erreur est survenue')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Current Password */}
      <div>
        <Label htmlFor="currentPassword">Mot de passe actuel</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
        />
      </div>

      {/* New Password */}
      <div>
        <Label htmlFor="newPassword">Nouveau mot de passe</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
        />
        <p className="text-xs text-slate-mid mt-1">
          Au moins 8 caractères, avec une majuscule, une minuscule et un chiffre
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
          ✅ Mot de passe modifié avec succès !
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        size="lg"
        className="w-full sm:w-auto"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Modification en cours...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Modifier le mot de passe
          </>
        )}
      </Button>
    </form>
  )
}
