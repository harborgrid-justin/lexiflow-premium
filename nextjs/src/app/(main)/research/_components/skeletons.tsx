/**
 * Research Module Skeleton Components
 * Loading states for research components
 *
 * @module research/_components/skeletons
 */

export function ResearchDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Projects Section Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-start justify-between animate-pulse">
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="flex gap-3">
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions Section Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-start gap-3 animate-pulse">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="flex gap-3">
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ResearchDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header Skeleton */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
            <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="flex gap-3 mt-4">
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Content */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>

          {/* Results Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-4 border-b border-slate-200 dark:border-slate-700 last:border-0">
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
              <div className="h-3 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-3 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="ml-4 flex flex-col items-end gap-2">
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SavedSearchesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="flex-1">
                <div className="h-5 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="flex gap-3">
                  <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {/* Date Group Header */}
      <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />

      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse"
        >
          <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      ))}
    </div>
  );
}
