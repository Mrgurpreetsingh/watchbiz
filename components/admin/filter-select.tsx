'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectOption } from '@/components/ui/select'

/**
 * 🎛️ Filter Select Component
 *
 * Dropdown filter pour listes admin avec URL params
 */

interface FilterSelectProps {
  name: string
  options: SelectOption[]
  placeholder?: string
  defaultValue?: string
}

export function FilterSelect({
  name,
  options,
  placeholder = 'Tous',
  defaultValue = ''
}: FilterSelectProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const handleChange = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams)

      if (value && value !== '') {
        params.set(name, value)
      } else {
        params.delete(name)
      }

      // Reset to page 1 when filtering
      params.delete('page')

      router.push(`?${params.toString()}`)
    })
  }

  return (
    <Select
      name={name}
      options={options}
      value={defaultValue}
      onValueChange={handleChange}
      placeholder={placeholder}
      disabled={isPending}
    />
  )
}
