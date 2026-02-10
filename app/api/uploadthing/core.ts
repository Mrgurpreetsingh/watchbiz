import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { auth } from '@/auth'

const f = createUploadthing()

/**
 * 📸 UploadThing File Router
 *
 * Configure file uploads pour images produits, catégories, marques
 */

export const ourFileRouter = {
  // Product images uploader (admins only)
  productImage: f({ image: { maxFileSize: '4MB', maxFileCount: 8 } })
    .middleware(async () => {
      const session = await auth()

      // Only admins can upload
      if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Non autorisé')
      }

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Product image uploaded:', file.url, 'by user:', metadata.userId)
      return { url: file.url }
    }),

  // Category images uploader (admins only)
  categoryImage: f({ image: { maxFileSize: '2MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()

      if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Non autorisé')
      }

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Category image uploaded:', file.url, 'by user:', metadata.userId)
      return { url: file.url }
    }),

  // Brand logo uploader (admins only)
  brandLogo: f({ image: { maxFileSize: '1MB', maxFileCount: 1 } })
    .middleware(async () => {
      const session = await auth()

      if (!session?.user || session.user.role !== 'ADMIN') {
        throw new Error('Non autorisé')
      }

      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Brand logo uploaded:', file.url, 'by user:', metadata.userId)
      return { url: file.url }
    })
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
