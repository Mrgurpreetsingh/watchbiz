'use client'

import { useState } from 'react'
import { UploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'
import { User2, Upload, Loader2 } from 'lucide-react'

interface AvatarUploadProps {
  currentImage?: string | null
  onUploadComplete: (url: string) => void
}

/**
 * 📸 Composant Upload Avatar
 *
 * Utilise UploadThing pour uploader l'avatar utilisateur
 * - Max 2MB
 * - Format image uniquement
 */
export function AvatarUpload({ currentImage, onUploadComplete }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700">
        {isUploading ? (
          <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
        ) : currentImage ? (
          <img
            src={currentImage}
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <User2 className="h-8 w-8 text-slate-400" />
        )}
      </div>

      {/* Upload Button */}
      <div className="flex-1">
        <UploadButton<OurFileRouter, "userAvatar">
          endpoint="userAvatar"
          onClientUploadComplete={(res) => {
            setIsUploading(false)
            if (res?.[0]?.url) {
              onUploadComplete(res[0].url)
            }
          }}
          onUploadError={(error: Error) => {
            setIsUploading(false)
            alert(`Erreur d'upload: ${error.message}`)
          }}
          onUploadBegin={() => {
            setIsUploading(true)
          }}
          appearance={{
            button: "bg-gold-champagne hover:bg-gold-dark text-luxury-black font-medium rounded-md px-4 py-2 text-sm transition-colors ut-ready:bg-gold-champagne ut-uploading:bg-gold-dark ut-uploading:cursor-not-allowed",
            allowedContent: "text-xs text-slate-600 dark:text-slate-400 mt-1"
          }}
          content={{
            button({ ready, isUploading }) {
              if (isUploading) return <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Upload...</div>
              if (ready) return <div className="flex items-center gap-2"><Upload className="h-4 w-4" /> Choisir une photo</div>
              return "Préparation..."
            },
            allowedContent: "Image (max 2MB)"
          }}
        />
      </div>
    </div>
  )
}
