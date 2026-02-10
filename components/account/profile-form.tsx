'use client'

import { useState, useTransition } from 'react'
import { User } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/actions/profile'
import { Loader2, Save, Upload } from 'lucide-react'

interface ProfileFormProps {
  user: Pick<User, 'id' | 'name' | 'email' | 'phone' | 'image'>
}

/**
 * 📝 Formulaire Édition Profil
 *
 * Permet de modifier nom, email, téléphone, avatar
 */
export function ProfileForm({ user }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateProfile(formData)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000) // Hide success after 3s
      } else {
        setError(result.error || 'Une erreur est survenue')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div>
        <Label>Photo de profil</Label>
        <div className="flex items-center gap-4 mt-2">
          {/* Avatar preview */}
          <div className="h-20 w-20 rounded-full bg-slate-light flex items-center justify-center overflow-hidden">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || 'Avatar'}
                className="h-full w-full object-cover"
              />
            ) : (
              <Upload className="h-8 w-8 text-slate-mid" />
            )}
          </div>

          {/* URL input (simple pour MVP, remplacer par upload Cloudinary plus tard) */}
          <div className="flex-1">
            <Input
              type="url"
              name="image"
              placeholder="URL de l'avatar (https://...)"
              defaultValue={user.image || ''}
            />
            <p className="text-xs text-slate-mid mt-1">
              Pour l'instant, entrez une URL d'image. Upload de fichier sera ajouté plus tard.
            </p>
          </div>
        </div>
      </div>

      {/* Nom */}
      <div>
        <Label htmlFor="name">Nom complet</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          defaultValue={user.name || ''}
          required
        />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="john@example.com"
          defaultValue={user.email || ''}
          required
        />
      </div>

      {/* Téléphone */}
      <div>
        <Label htmlFor="phone">Téléphone (optionnel)</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="0612345678"
          defaultValue={user.phone || ''}
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
          ✅ Profil mis à jour avec succès !
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
            Enregistrement...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer les modifications
          </>
        )}
      </Button>
    </form>
  )
}
