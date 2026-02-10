import { Skeleton } from '@/components/ui/skeleton'

/**
 * ⏳ Account Page Loading State
 */

export default function AccountLoading() {
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

        {/* Content Skeleton */}
        <main className="lg:col-span-3 space-y-8">
          <Skeleton className="h-10 w-48" />

          <div className="space-y-6 bg-white rounded-lg border p-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>

            <Skeleton className="h-10 w-48" />
          </div>
        </main>
      </div>
    </div>
  )
}
