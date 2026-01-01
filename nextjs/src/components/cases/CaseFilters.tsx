'use client';

/**
 * Case Filters Component - Client Component
 * Filter cases by status, priority, and other criteria
 */

import { cn } from '@/lib/utils';
import { CaseStatus, Priority } from '@/types';
import { useState } from 'react';

export function CaseFilters() {
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'ALL'>('ALL');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-6">
      {/* Status Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
          Status
        </h3>
        <div className="space-y-2">
          {['ALL', ...Object.values(CaseStatus)].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as CaseStatus | 'ALL')}
              className={cn(
                'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                selectedStatus === status
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Priority Filter */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
          Priority
        </h3>
        <div className="space-y-2">
          {['ALL', ...Object.values(Priority)].map((priority) => (
            <button
              key={priority}
              onClick={() => setSelectedPriority(priority as Priority | 'ALL')}
              className={cn(
                'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                selectedPriority === priority
                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {priority}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
