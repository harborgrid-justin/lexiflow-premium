/**
 * Integrations Page Loading UI
 */

export default function IntegrationsLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-8 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Category Tabs Loading */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
        ))}
      </div>

      {/* Integration Grid Loading */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-12 w-12 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1">
                <div className="h-5 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
                <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>

      {/* API Keys Section Loading */}
      <div className="mt-8">
        <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
          <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="h-10 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
