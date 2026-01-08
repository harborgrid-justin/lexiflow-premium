'use client';

/**
 * Quick Actions Component
 * Quick action buttons for common research operations
 *
 * @module research/_components/QuickActions
 */

import Link from 'next/link';
import { Plus, Bookmark, History, Scale, FileText } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/research/new"
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">New Project</span>
        <span className="sm:hidden">New</span>
      </Link>

      <Link
        href="/research/saved"
        className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
      >
        <Bookmark className="h-4 w-4" />
        <span className="hidden sm:inline">Saved</span>
      </Link>

      <Link
        href="/research/history"
        className="inline-flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-medium transition-colors"
      >
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">History</span>
      </Link>

      <div className="hidden md:flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
        <Link
          href="/research?type=case_law"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Scale className="h-4 w-4" />
          Case Law
        </Link>

        <Link
          href="/research?type=statute"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <FileText className="h-4 w-4" />
          Statutes
        </Link>
      </div>
    </div>
  );
}
