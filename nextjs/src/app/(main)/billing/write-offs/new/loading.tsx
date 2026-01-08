/**
 * New Write-Off Loading State
 */

export default function NewWriteOffLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header Skeleton */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2">
            <div className="h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-2">
            <div className="h-7 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-72 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>

        {/* Form sections */}
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
