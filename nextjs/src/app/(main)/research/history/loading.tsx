/**
 * Research History Loading UI
 *
 * @module research/history/loading
 */

import { HistorySkeleton } from '../_components/skeletons';

export default function HistoryLoading() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-6 py-6 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
              <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <div className="max-w-5xl mx-auto">
          <HistorySkeleton />
        </div>
      </main>
    </div>
  );
}
