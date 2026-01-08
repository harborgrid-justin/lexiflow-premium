/**
 * User Detail Page Loading UI
 */

export default function UserDetailLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Link Loading */}
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-6" />

      {/* Header Loading */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="h-24 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>

      {/* Content Loading */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Info Card Loading */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
            <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-1">
                    <div className="h-3 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Loading */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              ))}
            </div>
          </div>

          {/* Security Loading */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
            <div className="h-6 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="h-20 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        {/* Activity Loading */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-6">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-2 w-2 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700 mt-2" />
                <div className="space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
