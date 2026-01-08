/**
 * New Research Project Loading UI
 *
 * @module research/new/loading
 */

export default function NewResearchLoading() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-8 w-56 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </header>

      {/* Form Skeleton */}
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Link */}
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />

          {/* Basic Information Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
            <div className="space-y-4">
              <div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-24 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div>
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                  <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Research Questions Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="h-6 w-44 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Scope Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
            <div className="space-y-6">
              <div>
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  ))}
                </div>
              </div>
              <div>
                <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 animate-pulse">
            <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}
