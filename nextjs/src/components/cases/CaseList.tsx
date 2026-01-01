'use client';

/**
 * Case List Component - Client Component
 * Displays list of cases with filtering and sorting
 */

import { API_ENDPOINTS } from '@/lib/api-config';
import { cn } from '@/lib/utils';
import { Case, CaseStatus, Priority } from '@/types';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const statusColors: Record<CaseStatus, string> = {
  [CaseStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  [CaseStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [CaseStatus.CLOSED]: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
  [CaseStatus.ARCHIVED]: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
};

const priorityColors: Record<Priority, string> = {
  [Priority.LOW]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  [Priority.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  [Priority.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  [Priority.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export function CaseList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCases() {
      try {
        const response = await fetch(API_ENDPOINTS.CASES.LIST);
        const data = await response.json();
        setCases(data.data || []);
      } catch (error) {
        console.error('Failed to fetch cases:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">No cases found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cases.map((caseItem) => (
        <Link
          key={caseItem.id}
          href={`/cases/${caseItem.id}`}
          className="block p-6 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-600 dark:hover:border-blue-600 transition-colors"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {caseItem.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {caseItem.caseNumber}
              </p>
            </div>
            <div className="flex gap-2">
              <span className={cn('px-2 py-1 rounded text-xs font-medium', statusColors[caseItem.status])}>
                {caseItem.status}
              </span>
              <span className={cn('px-2 py-1 rounded text-xs font-medium', priorityColors[caseItem.priority])}>
                {caseItem.priority}
              </span>
            </div>
          </div>

          {caseItem.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
              {caseItem.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
            {caseItem.court && (
              <span>Court: {caseItem.court}</span>
            )}
            {caseItem.nextHearingDate && (
              <span>Next Hearing: {new Date(caseItem.nextHearingDate).toLocaleDateString()}</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
