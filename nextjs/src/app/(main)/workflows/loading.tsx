/**
 * Workflows Loading UI
 *
 * Displays while workflow pages are loading.
 * Provides consistent branded loading experience.
 *
 * @module app/(main)/workflows/loading
 */

export default function WorkflowsLoading() {
  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900">
      <div className="px-6 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-10 w-36 bg-blue-200 dark:bg-blue-900/30 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              </div>
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex space-x-8 pb-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Section Header Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 animate-pulse"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
              <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Table Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>

        {/* Table Skeleton */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <table className="min-w-full">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                {['Workflow', 'Status', 'Current Step', 'Progress', 'Started'].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {[...Array(3)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-6 py-4">
                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
