/**
 * Saved Searches Loading UI
 *
 * @module research/saved/loading
 */

import { SavedSearchesSkeleton } from '../_components/skeletons';

export default function SavedSearchesLoading() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto px-6 py-6 animate-pulse">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded mb-6" />
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-700 -mb-px">
            <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-t" />
            <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-t" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <SavedSearchesSkeleton />
        </div>
      </main>
    </div>
  );
}
