/**
 * Rate Tables Loading State
 */

export default function RateTablesLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-2">
                <div className="h-7 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
            <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats skeleton */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>

        {/* Rate tables skeleton */}
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
