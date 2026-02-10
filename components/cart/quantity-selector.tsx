import { Minus, Plus } from 'lucide-react'

interface QuantitySelectorProps {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
  max?: number
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  max = 99
}: QuantitySelectorProps) {
  return (
    <div className="flex items-center border border-border rounded-md">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="p-2 hover:bg-slate-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Diminuer la quantité"
      >
        <Minus className="h-3 w-3" />
      </button>

      <div className="w-12 text-center border-x border-border py-2 text-sm font-medium">
        {quantity}
      </div>

      <button
        onClick={onIncrease}
        disabled={quantity >= max}
        className="p-2 hover:bg-slate-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Augmenter la quantité"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  )
}
