/**
 * New Time Entry Loading State
 */

export default function NewTimeEntryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-white px-6 py-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-2">
              <div className="h-7 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-56 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="space-y-6">
          <div className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          <div className="flex justify-end gap-3">
            <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
