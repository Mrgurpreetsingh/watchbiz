// 🖥️ BACKEND - API Route
// Accès direct à Prisma/PostgreSQL
// Retourne du JSON pour clients externes ou fetch()

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/products - Liste tous les produits
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category: { slug: category } }),
        ...(brand && { brand: { slug: brand } }),
      },
      include: {
        category: true,
        brand: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Créer un produit (admin only)
export async function POST(req: NextRequest) {
  try {
    // TODO: Vérifier authentification admin
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price,
        categoryId: body.categoryId,
        brandId: body.brandId,
        images: body.images || [],
        quantity: body.quantity || 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
