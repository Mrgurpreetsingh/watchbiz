'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * 🔍 Search Input Component
 *
 * Barre de recherche avec debounce pour listes admin
 */

interface SearchInputProps {
  placeholder?: string
  defaultValue?: string
}

export function SearchInput({ placeholder = 'Rechercher...', defaultValue = '' }: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(defaultValue)

  const handleSearch = (value: string) => {
    setSearch(value)

    // Update URL with search params
    startTransition(() => {
      const params = new URLSearchParams(searchParams)

      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }

      // Reset to page 1 when searching
      params.delete('page')

      router.push(`?${params.toString()}`)
    })
  }

  const handleClear = () => {
    setSearch('')

    startTransition(() => {
      const params = new URLSearchParams(searchParams)
      params.delete('search')
      params.delete('page')
      router.push(`?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-mid pointer-events-none" />

      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10"
        disabled={isPending}
      />

      {search && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
