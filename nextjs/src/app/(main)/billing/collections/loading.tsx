/**
 * Collections Loading State
 *
 * Displays skeleton UI while collections data is being fetched.
 *
 * @module billing/collections/loading
 */

export default function CollectionsLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header skeleton */}
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
                <div>
                  <div className="h-6 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-28 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary stats skeleton */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="mb-6 h-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />

        {/* Collection items skeleton */}
        <div className="space-y-6">
          {/* Critical section skeleton */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="h-12 animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-700">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>

          {/* Other items skeleton */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="h-12 animate-pulse bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-0 divide-y divide-slate-100 dark:divide-slate-700">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
