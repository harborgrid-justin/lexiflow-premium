/**
 * Settings Page Loading UI
 */

export default function SettingsLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      {/* Settings Grid Loading */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-4 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
            <div className="space-y-3">
              <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>

      {/* Save Button Loading */}
      <div className="mt-6 flex justify-end">
        <div className="h-10 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
}
