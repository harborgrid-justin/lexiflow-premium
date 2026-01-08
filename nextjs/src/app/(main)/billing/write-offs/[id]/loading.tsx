/**
 * Write-Off Detail Loading State
 */

export default function WriteOffDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header Skeleton */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
              <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          {/* Status Banner */}
          <div className="h-24 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />

          {/* Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="space-y-6">
              <div className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="h-36 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
              <div className="h-36 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
