/**
 * AR Aging Loading State
 *
 * Displays skeleton UI while AR aging data is being fetched.
 *
 * @module billing/ar-aging/loading
 */

export default function ARAgingLoading() {
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
                  <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-2 h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            </div>
            <div className="h-10 w-40 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Filter bar skeleton */}
        <div className="mb-6 h-16 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />

        {/* Summary cards skeleton */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>

        {/* Aging buckets skeleton */}
        <div className="mb-8">
          <div className="mb-4 h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
              />
            ))}
          </div>
        </div>

        {/* Chart and table skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-200 lg:col-span-2 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
