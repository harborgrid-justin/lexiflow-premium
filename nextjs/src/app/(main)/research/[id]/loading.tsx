/**
 * Research Detail Loading UI
 *
 * @module research/[id]/loading
 */

import { ResearchDetailSkeleton } from '../_components/skeletons';

export default function ResearchDetailLoading() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Header Skeleton */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div>
                <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <ResearchDetailSkeleton />
        </div>
      </main>
    </div>
  );
}
