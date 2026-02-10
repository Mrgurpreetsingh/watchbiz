import { Skeleton } from '@/components/ui/skeleton'

/**
 * ⏳ Orders Page Loading State
 */

export default function OrdersLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Skeleton */}
        <aside className="lg:col-span-1">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        </aside>

        {/* Orders List Skeleton */}
        <main className="lg:col-span-3 space-y-6">
          <Skeleton className="h-10 w-48" />

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>

                {/* Items Preview */}
                <div className="flex gap-4">
                  {Array.from({ length: 2 }).map((_, j) => (
                    <Skeleton key={j} className="h-20 w-20 rounded" />
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
