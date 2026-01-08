/**
 * Research Loading UI
 * Displays while the research page is loading
 *
 * Next.js 16 Compliance:
 * - Server Component
 * - Matches research page layout
 *
 * @module research/loading
 */

export default function ResearchLoading() {
  return (
    <div className="flex flex-col min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Header Skeleton */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-72 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search Section Skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-full" />
            <div className="flex gap-2 mt-4">
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                    <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                  </div>
                  <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Projects Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between">
                  <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                      <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sessions Card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-pulse">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between">
                  <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 animate-pulse">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
