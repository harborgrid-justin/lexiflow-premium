/**
 * Billing Loading State
 *
 * Displays while billing pages are loading.
 * Provides skeleton UI for better perceived performance.
 */

export default function BillingLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header Skeleton */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-7 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Metrics */}
        <div className="mb-8">
          <div className="mb-4 h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>

        {/* WIP */}
        <div className="mb-8">
          <div className="mb-4 h-6 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="grid gap-4 sm:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                />
              ))}
            </div>
          </div>
          <div className="h-80 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
