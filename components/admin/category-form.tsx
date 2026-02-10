'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ImageUploader } from '@/components/admin/image-uploader'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { createCategory, updateCategory } from '@/actions/admin-categories'
import { toast } from 'sonner'
import type { Category } from '@prisma/client'

/**
 * 📁 Category Form Component
 *
 * Formulaire de création/édition de catégorie
 */

interface CategoryFormProps {
  category?: Category
  mode: 'create' | 'edit'
}

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [name, setName] = useState(category?.name || '')
  const [slug, setSlug] = useState(category?.slug || '')
  const [description, setDescription] = useState(category?.description || '')
  const [image, setImage] = useState<string>(category?.image || '')

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value)

    // Only auto-generate slug in create mode
    if (mode === 'create') {
      const autoSlug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
        .replace(/^-+|-+$/g, '') // Trim dashes

      setSlug(autoSlug)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation basique
    if (!name.trim()) {
      toast.error('Erreur', { description: 'Le nom de la catégorie est requis' })
      return
    }

    if (!slug.trim()) {
      toast.error('Erreur', { description: 'Le slug est requis' })
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append('name', name.trim())
        formData.append('slug', slug.trim())
        formData.append('description', description.trim())
        formData.append('image', image)

        let result

        if (mode === 'create') {
          result = await createCategory(formData)
        } else {
          result = await updateCategory(category!.id, formData)
        }

        if (result.success) {
          toast.success(
            mode === 'create' ? 'Catégorie créée' : 'Catégorie mise à jour',
            {
              description:
                mode === 'create'
                  ? 'La catégorie a été créée avec succès'
                  : 'Les modifications ont été enregistrées'
            }
          )

          router.push('/admin/categories')
          router.refresh()
        } else {
          toast.error('Erreur', { description: result.error || 'Une erreur est survenue' })
        }
      } catch (error) {
        console.error('Error submitting category form:', error)
        toast.error('Erreur', { description: 'Une erreur est survenue' })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Back Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push('/admin/categories')}
        disabled={isPending}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      {/* Main Info */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-luxury-black">
          Informations générales
        </h2>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" required>
            Nom de la catégorie
          </Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ex: Montres de luxe"
            disabled={isPending}
            required
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug" required>
            Slug (URL)
          </Label>
          <Input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Ex: montres-de-luxe"
            disabled={isPending}
            required
          />
          <p className="text-sm text-slate-mid">
            Utilisé dans l&apos;URL : <code>/categories/{slug || 'slug'}</code>
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optionnel)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de la catégorie..."
            rows={4}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Image */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-luxury-black">Image</h2>

        <ImageUploader
          images={image ? [image] : []}
          onImagesChange={(images) => setImage(images[0] || '')}
          maxFiles={1}
          endpoint="categoryImage"
          disabled={isPending}
        />

        {!image && (
          <p className="text-sm text-slate-mid">L&apos;image est optionnelle.</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/categories')}
          disabled={isPending}
        >
          Annuler
        </Button>

        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {mode === 'create' ? 'Création...' : 'Enregistrement...'}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Créer la catégorie' : 'Enregistrer'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
