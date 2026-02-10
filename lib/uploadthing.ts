import { generateReactHelpers } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

/**
 * 🔧 UploadThing Client Helpers
 *
 * Typed helpers pour utiliser UploadThing dans les composants React
 */

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>()
