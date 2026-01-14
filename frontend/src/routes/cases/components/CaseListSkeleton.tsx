/**
 * Case List Skeleton - Loading State
 *
 * ENTERPRISE ARCHITECTURE:
 * - Suspense fallback component
 * - Matches final layout structure
 * - Provides visual feedback during load
 * - Accessible (aria-label, aria-busy)
 *
 * @module routes/cases/components/CaseListSkeleton
 */

import { Skeleton } from '@/components/atoms/Skeleton/Skeleton';

export function CaseListSkeleton() {
  return (
    <div
      className="space-y-6 animate-pulse"
      role="status"
      aria-label="Loading cases"
      aria-busy="true"
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Metrics cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>

      {/* Parent tabs skeleton */}
      <div className="flex space-x-1 bg-secondary/20 p-1 rounded-lg">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>

      {/* Sub tabs skeleton */}
      <div className="flex flex-wrap gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-28" />
        ))}
      </div>

      {/* Content area skeleton */}
      <div className="rounded-lg border bg-card p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>

      <span className="sr-only">Loading case list...</span>
    </div>
  );
}
