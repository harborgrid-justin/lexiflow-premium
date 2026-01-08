/**
 * Invoice Detail Loading State
 */

export default function InvoiceDetailLoading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-7xl">
          <div className="h-5 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          <div className="h-20 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-96 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
