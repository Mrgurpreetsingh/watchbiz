// 🖥️ BACKEND - API Route dynamique
// GET /api/products/[id] - Récupérer un produit

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/products/:id
export async function GET(req: NextRequest, context: Params) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PATCH /api/products/:id - Modifier un produit
export async function PATCH(req: NextRequest, context: Params) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/:id - Supprimer un produit
export async function DELETE(req: NextRequest, context: Params) {
  try {
    const { id } = await context.params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
