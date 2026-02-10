// 🖥️ BACKEND - Server Actions
// Alternative aux API Routes pour mutations
// Appelable directement depuis composants/forms

'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';
import { z } from 'zod';

// Schema de validation
const productSchema = z.object({
  name: z.string().min(3, 'Le nom doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  price: z.number().positive('Le prix doit être positif'),
  categoryId: z.string().cuid('ID de catégorie invalide'),
  brandId: z.string().cuid('ID de marque invalide'),
  quantity: z.number().int().min(0, 'La quantité doit être positive'),
  images: z.array(z.string().url()).optional(),
});

type ProductInput = z.infer<typeof productSchema>;

export async function createProduct(data: ProductInput) {
  try {
    // Validation avec Zod
    const validated = productSchema.parse(data);

    // Créer le produit
    const product = await prisma.product.create({
      data: {
        ...validated,
        slug: slugify(validated.name),
        isActive: true,
      },
    });

    // Revalider les pages concernées
    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true, product };
  } catch (error) {
    console.error('Error creating product:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(data.name && { slug: slugify(data.name) }),
      },
    });

    revalidatePath(`/products/${product.slug}`);
    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true, product };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id },
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'Failed to delete product' };
  }
}

export async function toggleProductActive(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    revalidatePath('/products');
    revalidatePath('/admin/products');

    return { success: true, product: updated };
  } catch (error) {
    console.error('Error toggling product:', error);
    return { success: false, error: 'Failed to toggle product' };
  }
}
