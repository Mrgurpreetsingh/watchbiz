/**
 * 🔍 API Route - Recherche Produits
 *
 * GET /api/products/search?q=rolex
 * - Recherche dans : name, brand.name, description
 * - Max 5 résultats (autocomplete)
 * - Filtres optionnels : categoryId, brandId, priceMin, priceMax
 */

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const categoryId = searchParams.get('categoryId')
    const brandId = searchParams.get('brandId')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const limit = parseInt(searchParams.get('limit') || '5')

    // Construire le where clause dynamiquement
    const where: any = {
      isActive: true,
      AND: [],
    }

    // Recherche textuelle (name, description, brand)
    if (query.trim()) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
      ]
    }

    // Filtres
    if (categoryId) {
      where.AND.push({ categoryId })
    }

    if (brandId) {
      where.AND.push({ brandId })
    }

    if (priceMin) {
      where.AND.push({ price: { gte: parseFloat(priceMin) } })
    }

    if (priceMax) {
      where.AND.push({ price: { lte: parseFloat(priceMax) } })
    }

    // Nettoyer AND si vide
    if (where.AND.length === 0) {
      delete where.AND
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: true,
        category: true,
      },
      take: limit,
      orderBy: [
        { isFeatured: 'desc' }, // Featured en premier
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({
      success: true,
      results: products,
      count: products.length,
    })
  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search products',
      },
      { status: 500 }
    )
  }
}
