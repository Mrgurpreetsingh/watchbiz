'use client'

/**
 * 💰 Price Range Filter - Slider double thumb pour filtrer par prix
 *
 * Features:
 * - Double thumb slider (min/max)
 * - Range : 0€ - 20000€, step 100€
 * - Affichage valeurs formatPrice()
 * - onChange callback pour parent
 * - Radix UI Slider (accessible)
 */

import { useState } from 'react'
import * as Slider from '@radix-ui/react-slider'
import { formatPrice } from '@/lib/utils'

interface PriceRangeFilterProps {
  min?: number
  max?: number
  defaultValue?: [number, number]
  onChange?: (range: [number, number]) => void
}

export function PriceRangeFilter({
  min = 0,
  max = 20000,
  defaultValue = [0, 20000],
  onChange,
}: PriceRangeFilterProps) {
  const [range, setRange] = useState<[number, number]>(defaultValue)

  const handleValueChange = (values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]]
    setRange(newRange)
    onChange?.(newRange)
  }

  return (
    <div className="space-y-4">
      {/* Values Display */}
      <div className="flex items-center justify-between">
        <div className="rounded-md bg-slate-light/50 px-3 py-2">
          <span className="text-sm font-medium text-luxury-black">
            {formatPrice(range[0])}
          </span>
        </div>
        <span className="text-sm text-slate-mid">-</span>
        <div className="rounded-md bg-slate-light/50 px-3 py-2">
          <span className="text-sm font-medium text-luxury-black">
            {formatPrice(range[1])}
          </span>
        </div>
      </div>

      {/* Slider */}
      <Slider.Root
        className="relative flex h-5 w-full touch-none select-none items-center"
        value={range}
        onValueChange={handleValueChange}
        min={min}
        max={max}
        step={100}
        minStepsBetweenThumbs={1}
        aria-label="Price range"
      >
        {/* Track */}
        <Slider.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-light">
          {/* Range */}
          <Slider.Range className="absolute h-full bg-gold-champagne" />
        </Slider.Track>

        {/* Thumb Min */}
        <Slider.Thumb
          className="block h-5 w-5 cursor-pointer rounded-full border-2 border-gold-champagne bg-white shadow-md transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2"
          aria-label="Prix minimum"
        />

        {/* Thumb Max */}
        <Slider.Thumb
          className="block h-5 w-5 cursor-pointer rounded-full border-2 border-gold-champagne bg-white shadow-md transition-shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gold-champagne focus:ring-offset-2"
          aria-label="Prix maximum"
        />
      </Slider.Root>

      {/* Min/Max Labels */}
      <div className="flex justify-between text-xs text-slate-mid">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  )
}
