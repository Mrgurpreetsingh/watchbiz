'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectOption } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { ImageUploader } from '@/components/admin/image-uploader'
import { createProduct, updateProduct } from '@/actions/admin-products'
import { useToast } from '@/lib/hooks/use-toast'
import { Loader2, Save } from 'lucide-react'
import { Product, Category, Brand } from '@prisma/client'

/**
 * 📝 Product Form
 *
 * Formulaire création/édition produit
 */

interface ProductFormProps {
  product?: Product
  categories: Category[]
  brands: Brand[]
  mode: 'create' | 'edit'
}

export function ProductForm({ product, categories, brands, mode }: ProductFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const { error: showError, success: showSuccess } = useToast()
  const router = useRouter()

  // Form state
  const [images, setImages] = useState<string[]>(product?.images || [])
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false)
  const [isActive, setIsActive] = useState(product?.isActive !== false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.set('images', JSON.stringify(images.filter((img) => img.trim())))
    formData.set('isFeatured', isFeatured.toString())
    formData.set('isActive', isActive.toString())

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createProduct(formData)
          : await updateProduct(product!.id, formData)

      if (result.success) {
        showSuccess(
          mode === 'create' ? 'Produit créé' : 'Produit modifié',
          `Le produit a été ${mode === 'create' ? 'créé' : 'modifié'} avec succès`
        )
        router.push('/admin/products')
        router.refresh()
      } else {
        setError(result.error || 'Une erreur est survenue')
        showError('Erreur', result.error || 'Une erreur est survenue')
      }
    })
  }


  const categoryOptions: SelectOption[] = categories.map((cat) => ({
    value: cat.id,
    label: cat.name
  }))

  const brandOptions: SelectOption[] = brands.map((brand) => ({
    value: brand.id,
    label: brand.name
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-luxury-black">
          Informations de base
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={product?.name}
              placeholder="Rolex Submariner"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              name="slug"
              type="text"
              defaultValue={product?.slug}
              placeholder="rolex-submariner"
              required
              disabled={isPending}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={product?.description}
            placeholder="Description détaillée du produit..."
            required
            disabled={isPending}
          />
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-luxury-black">
          Prix et stock
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">Prix de vente * (€)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={product?.price}
              placeholder="1299.99"
              required
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="compareAtPrice">Prix barré (€)</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              step="0.01"
              defaultValue={product?.compareAtPrice || ''}
              placeholder="1499.99"
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="costPrice">Prix de revient (€)</Label>
            <Input
              id="costPrice"
              name="costPrice"
              type="number"
              step="0.01"
              defaultValue={product?.costPrice || ''}
              placeholder="899.99"
              disabled={isPending}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              name="sku"
              type="text"
              defaultValue={product?.sku || ''}
              placeholder="ROL-SUB-001"
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              defaultValue={product?.stock || 0}
              placeholder="10"
              required
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Category & Brand */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-luxury-black">
          Catégorie et marque
        </h2>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="categoryId">Catégorie *</Label>
            <Select
              name="categoryId"
              options={categoryOptions}
              value={product?.categoryId}
              placeholder="Sélectionner une catégorie"
              disabled={isPending}
            />
          </div>

          <div>
            <Label htmlFor="brandId">Marque *</Label>
            <Select
              name="brandId"
              options={brandOptions}
              value={product?.brandId}
              placeholder="Sélectionner une marque"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-luxury-black">
          Images
        </h2>

        <ImageUploader
          images={images}
          onImagesChange={setImages}
          maxFiles={8}
          endpoint="productImage"
          disabled={isPending}
        />

        {images.length === 0 && (
          <p className="text-sm text-red-600">
            Au moins une image est requise.
          </p>
        )}
      </div>

      {/* Options */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-luxury-black">
          Options
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="isFeatured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
              disabled={isPending}
            />
            <Label htmlFor="isFeatured" className="cursor-pointer">
              Produit mis en avant (affiché en priorité sur la page d'accueil)
            </Label>
          </div>

          <div className="flex items-center gap-3">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isPending}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Produit actif (visible dans la boutique)
            </Label>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Créer le produit' : 'Enregistrer les modifications'}
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Annuler
        </Button>
      </div>
    </form>
  )
}
