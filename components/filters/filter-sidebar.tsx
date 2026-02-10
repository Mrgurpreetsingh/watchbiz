'use client'

/**
 * 🎛️ Filter Sidebar - Sidebar filtres produits
 *
 * Features:
 * - Filtres : Catégories, Marques, Prix
 * - Accordions pour organisation
 * - Reset filters button
 * - Responsive : sidebar (desktop), caché (mobile - à améliorer)
 * - URL search params (SEO friendly)
 */

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PriceRangeFilter } from './price-range-filter'

interface FilterSidebarProps {
  categories: Array<{ id: string; name: string; slug: string }>
  brands: Array<{ id: string; name: string; slug: string }>
}

export function FilterSidebar({ categories, brands }: FilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('categoryId')
  )
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    searchParams.get('brandId')
  )
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get('priceMin') || '0'),
    parseInt(searchParams.get('priceMax') || '20000'),
  ])

  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (selectedCategory) {
      params.set('categoryId', selectedCategory)
    }

    if (selectedBrand) {
      params.set('brandId', selectedBrand)
    }

    if (priceRange[0] > 0) {
      params.set('priceMin', priceRange[0].toString())
    }

    if (priceRange[1] < 20000) {
      params.set('priceMax', priceRange[1].toString())
    }

    router.push(`/products?${params.toString()}`)
  }

  const resetFilters = () => {
    setSelectedCategory(null)
    setSelectedBrand(null)
    setPriceRange([0, 20000])
    router.push('/products')
  }

  const hasActiveFilters =
    selectedCategory || selectedBrand || priceRange[0] > 0 || priceRange[1] < 20000

  return (
    <aside className="hidden w-64 flex-shrink-0 lg:block">
      <div className="sticky top-4 rounded-lg border border-border bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold text-luxury-black">
            Filtres
          </h2>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm font-medium text-gold-champagne hover:text-gold-dark"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="mb-6 border-b border-border pb-6">
          <button
            onClick={() => toggleSection('category')}
            className="mb-3 flex w-full items-center justify-between"
          >
            <h3 className="font-semibold text-luxury-black">Catégories</h3>
            <svg
              className={`h-5 w-5 text-slate-mid transition-transform ${
                openSections.category ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {openSections.category && (
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center gap-2 hover:text-luxury-black"
                >
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category.id}
                    onChange={() => setSelectedCategory(category.id)}
                    className="h-4 w-4 border-slate-mid text-gold-champagne focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Brands */}
        <div className="mb-6 border-b border-border pb-6">
          <button
            onClick={() => toggleSection('brand')}
            className="mb-3 flex w-full items-center justify-between"
          >
            <h3 className="font-semibold text-luxury-black">Marques</h3>
            <svg
              className={`h-5 w-5 text-slate-mid transition-transform ${
                openSections.brand ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {openSections.brand && (
            <div className="space-y-2">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex cursor-pointer items-center gap-2 hover:text-luxury-black"
                >
                  <input
                    type="radio"
                    name="brand"
                    checked={selectedBrand === brand.id}
                    onChange={() => setSelectedBrand(brand.id)}
                    className="h-4 w-4 border-slate-mid text-gold-champagne focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2"
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('price')}
            className="mb-3 flex w-full items-center justify-between"
          >
            <h3 className="font-semibold text-luxury-black">Prix</h3>
            <svg
              className={`h-5 w-5 text-slate-mid transition-transform ${
                openSections.price ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {openSections.price && (
            <PriceRangeFilter
              min={0}
              max={20000}
              defaultValue={priceRange}
              onChange={setPriceRange}
            />
          )}
        </div>

        {/* Apply Button */}
        <button
          onClick={applyFilters}
          className="w-full rounded-md bg-luxury-black px-4 py-3 font-semibold text-ivory transition-colors hover:bg-onyx focus:outline-none focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2"
        >
          Appliquer les filtres
        </button>
      </div>
    </aside>
  )
}
