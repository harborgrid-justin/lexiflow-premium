/**
 * Audit Page Loading UI
 */

export default function AuditLoading() {
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
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Stats Loading */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-2" />
            <div className="h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>

      {/* Filter Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-10 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Table Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex items-center gap-4 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1">
                <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Loading */}
      <div className="mt-6 flex items-center justify-between">
        <div className="h-4 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
    </div>
  );
}
