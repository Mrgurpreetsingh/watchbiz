'use client'

import { useState, useTransition } from 'react'
import { User } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/actions/profile'
import { AvatarUpload } from './avatar-upload'
import { Loader2, Save } from 'lucide-react'

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.image)

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
        <div className="mt-2">
          <AvatarUpload
            currentImage={avatarUrl}
            onUploadComplete={(url) => {
              setAvatarUrl(url)
              setSuccess(true)
              setTimeout(() => setSuccess(false), 3000)
            }}
          />
          {/* Hidden input pour envoyer l'URL dans le form */}
          <input type="hidden" name="image" value={avatarUrl || ''} />
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
