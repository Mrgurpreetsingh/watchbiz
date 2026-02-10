'use client'

import { useState } from 'react'
import { useUploadThing } from '@/lib/uploadthing'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, X, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

/**
 * 📸 Image Uploader
 *
 * Composant upload d'images avec UploadThing
 */

interface ImageUploaderProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxFiles?: number
  endpoint: 'productImage' | 'categoryImage' | 'brandLogo'
  disabled?: boolean
}

export function ImageUploader({
  images,
  onImagesChange,
  maxFiles = 8,
  endpoint,
  disabled = false
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { startUpload } = useUploadThing(endpoint)
  const { error: showError, success: showSuccess } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check max files limit
    if (images.length + files.length > maxFiles) {
      showError(
        'Limite atteinte',
        `Vous ne pouvez uploader que ${maxFiles} images maximum`
      )
      return
    }

    setIsUploading(true)

    try {
      const uploadedFiles = await startUpload(Array.from(files))

      if (!uploadedFiles || uploadedFiles.length === 0) {
        throw new Error('Upload échoué')
      }

      const newUrls = uploadedFiles.map((file) => file.url)
      onImagesChange([...images, ...newUrls])

      showSuccess(
        'Images uploadées',
        `${uploadedFiles.length} image(s) uploadée(s) avec succès`
      )

      // Reset input
      e.target.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      showError('Erreur upload', 'Impossible d\'uploader les images')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg border overflow-hidden bg-slate-light"
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Remove button (overlay on hover) */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                disabled={disabled || isUploading}
                className="absolute inset-0 bg-luxury-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <div className="bg-white rounded-full p-2">
                  <X className="h-5 w-5 text-red-600" />
                </div>
              </button>

              {/* Image number badge */}
              <div className="absolute top-2 left-2 bg-luxury-black/80 text-white text-xs font-semibold px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxFiles && (
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Uploader des images
              </>
            )}
          </Button>

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple={maxFiles > 1}
            onChange={handleFileChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          <p className="text-sm text-slate-mid">
            {images.length} / {maxFiles} images
          </p>
        </div>
      )}

      {/* Empty State */}
      {images.length === 0 && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="h-12 w-12 text-slate-mid mx-auto mb-3" />
          <p className="text-sm text-slate-mid mb-4">
            Aucune image uploadée
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={disabled || isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Uploader des images
          </Button>
        </div>
      )}

      <p className="text-xs text-slate-mid">
        Formats acceptés : JPG, PNG, WebP. Max{' '}
        {endpoint === 'productImage'
          ? '4MB'
          : endpoint === 'categoryImage'
            ? '2MB'
            : '1MB'}{' '}
        par fichier.
      </p>
    </div>
  )
}
