/**
 * Health Page Loading UI
 */

export default function HealthLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-80 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-10 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Overall Status Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>

      {/* System Metrics Loading */}
      <div className="mb-6">
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
              <div className="h-2 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Application Metrics Loading */}
      <div className="mb-6">
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Health Checks Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="flex gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            ))}
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
              <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="space-y-1 flex-1">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
