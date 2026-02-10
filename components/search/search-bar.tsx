'use client'

/**
 * 🔍 Search Bar - Barre de recherche avec autocomplete
 *
 * Features:
 * - Debounce 300ms
 * - Autocomplete dropdown (max 5 résultats)
 * - Navigation clavier (ArrowUp/Down, Enter, Escape)
 * - Clear button
 * - Loading state
 * - Highlight search term
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  brand: {
    name: string
  }
  images: string[]
}

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
}

export function SearchBar({
  onSearch,
  placeholder = 'Rechercher une montre, une marque...',
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        searchProducts(query)
      } else {
        setResults([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const searchProducts = async (searchQuery: string) => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=5`
      )
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
        setShowDropdown(data.results.length > 0)
      }
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)

    if (onSearch) {
      onSearch(value)
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setShowDropdown(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleSelectResult = (slug: string) => {
    setQuery('')
    setShowDropdown(false)
    router.push(`/products/${slug}`)
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelectResult(results[selectedIndex].slug)
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowDropdown(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Highlight search term
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-gold-champagne/30 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  return (
    <div className="relative w-full">
      {/* Input Container */}
      <div className="relative">
        {/* Search Icon */}
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-mid"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-white py-3 pl-12 pr-12 font-body text-base text-luxury-black placeholder:text-slate-mid focus:border-gold-champagne focus:outline-none focus:ring-2 focus:ring-gold-champagne/20"
          aria-label="Rechercher des produits"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={showDropdown}
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-mid hover:text-luxury-black"
            aria-label="Effacer la recherche"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="h-5 w-5 animate-spin text-gold-champagne"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          id="search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-lg border border-border bg-white shadow-xl"
        >
          {results.map((product, index) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={() => setShowDropdown(false)}
              role="option"
              aria-selected={index === selectedIndex}
              className={`flex items-center gap-4 border-b border-border p-4 transition-colors last:border-0 ${
                index === selectedIndex
                  ? 'bg-gold-champagne/10'
                  : 'hover:bg-slate-light/50'
              }`}
            >
              {/* Image Thumbnail */}
              {product.images[0] && (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-light">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-mid">
                  {highlightMatch(product.brand.name, query)}
                </p>
                <p className="mb-1 line-clamp-1 font-semibold text-luxury-black">
                  {highlightMatch(product.name, query)}
                </p>
                <p className="font-accent text-lg font-semibold text-gold-champagne">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="h-5 w-5 flex-shrink-0 text-slate-mid"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {showDropdown && !loading && query.trim().length >= 2 && results.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-lg border border-border bg-white p-6 text-center shadow-xl">
          <p className="text-sm text-slate-mid">
            Aucun résultat pour <strong>"{query}"</strong>
          </p>
        </div>
      )}
    </div>
  )
}
