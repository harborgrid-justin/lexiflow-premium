/**
 * FilingsTable Component
 *
 * Displays court filings with deadlines and status tracking.
 * Supports sorting, filtering, and deadline warnings.
 *
 * @module components/features/cases/FilingsTable
 */

import { cn } from '@/shared/lib/utils';
import { useState } from 'react';
import { format, isBefore, differenceInDays } from 'date-fns';

export interface Filing {
  id: string;
  title: string;
  type: string;
  filingDate: string;
  deadline?: string;
  status: 'draft' | 'pending' | 'filed' | 'rejected' | 'withdrawn';
  filedBy?: string;
  docketNumber?: string;
  documentUrl?: string;
  notes?: string;
}

export interface FilingsTableProps {
  /** Array of filings to display */
  filings: Filing[];
  /** Optional click handler for filing selection */
  onSelectFiling?: (filing: Filing) => void;
  /** Show actions column */
  showActions?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Get filing status badge configuration
 */
function getFilingStatusBadge(status: Filing['status']): {
  bgColor: string;
  textColor: string;
  icon: string;
} {
  const statusMap: Record<Filing['status'], { bgColor: string; textColor: string; icon: string }> = {
    draft: {
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      textColor: 'text-gray-700 dark:text-gray-400',
      icon: '📝'},
    pending: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      icon: '⏳'},
    filed: {
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-400',
      icon: '✅'},
    rejected: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-700 dark:text-red-400',
      icon: '❌'},
    withdrawn: {
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      textColor: 'text-gray-600 dark:text-gray-500',
      icon: '🚫'}};

  return statusMap[status];
}

/**
 * Get deadline urgency level
 */
function getDeadlineUrgency(deadline: string | undefined): {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical' | 'overdue';
  color: string;
  bgColor: string;
} {
  if (!deadline) {
    return {
      level: 'none',
      color: 'text-gray-500 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20'};
  }

  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysUntilDeadline = differenceInDays(deadlineDate, now);

  if (isBefore(deadlineDate, now)) {
    return {
      level: 'overdue',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30'};
  }

  if (daysUntilDeadline <= 3) {
    return {
      level: 'critical',
      color: 'text-red-700 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20'};
  }

  if (daysUntilDeadline <= 7) {
    return {
      level: 'high',
      color: 'text-orange-700 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'};
  }

  if (daysUntilDeadline <= 14) {
    return {
      level: 'medium',
      color: 'text-yellow-700 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'};
  }

  return {
    level: 'low',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'};
}

/**
 * Format date for display
 */
function formatDate(date: string | undefined): string {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

/**
 * FilingsTable component displays court filings in a table
 */
export function FilingsTable({
  filings,
  onSelectFiling,
  showActions = true,
  className}: FilingsTableProps) {
  const [sortField, setSortField] = useState<keyof Filing>('filingDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<Filing['status'] | 'all'>('all');

  const handleSort = (field: keyof Filing) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredFilings = filterStatus === 'all'
    ? filings
    : filings.filter(f => f.status === filterStatus);

  const sortedFilings = [...filteredFilings].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    const comparison = String(aValue).localeCompare(String(bValue));
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (filings.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50', className)}>
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No filings</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Court filings and documents will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            filterStatus === 'all'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          All
        </button>
        <button
          onClick={() => setFilterStatus('draft')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            filterStatus === 'draft'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          Draft
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            filterStatus === 'pending'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          Pending
        </button>
        <button
          onClick={() => setFilterStatus('filed')}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            filterStatus === 'filed'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
          )}
        >
          Filed
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-1">
                    <span>Filing</span>
                    {sortField === 'title' && (
                      <svg className={cn('h-4 w-4', sortDirection === 'desc' && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {sortField === 'status' && (
                      <svg className={cn('h-4 w-4', sortDirection === 'desc' && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                  onClick={() => handleSort('filingDate')}
                >
                  <div className="flex items-center gap-1">
                    <span>Filed Date</span>
                    {sortField === 'filingDate' && (
                      <svg className={cn('h-4 w-4', sortDirection === 'desc' && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Deadline
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Filed By
                </th>
                {showActions && (
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {sortedFilings.map((filing) => {
                const statusBadge = getFilingStatusBadge(filing.status);
                const deadlineUrgency = getDeadlineUrgency(filing.deadline);

                return (
                  <tr
                    key={filing.id}
                    className={cn(
                      'hover:bg-gray-50 dark:hover:bg-gray-800',
                      onSelectFiling && 'cursor-pointer'
                    )}
                    onClick={() => onSelectFiling?.(filing)}
                  >
                    {/* Filing Title & Type */}
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {filing.title}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="inline-flex rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                              {filing.type}
                            </span>
                            {filing.docketNumber && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                #{filing.docketNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                          statusBadge.bgColor,
                          statusBadge.textColor
                        )}
                      >
                        <span aria-hidden="true">{statusBadge.icon}</span>
                        <span className="capitalize">{filing.status}</span>
                      </span>
                    </td>

                    {/* Filing Date */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(filing.filingDate)}
                    </td>

                    {/* Deadline */}
                    <td className="whitespace-nowrap px-6 py-4">
                      {filing.deadline ? (
                        <div className={cn('inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium', deadlineUrgency.bgColor, deadlineUrgency.color)}>
                          {deadlineUrgency.level === 'overdue' && '🚨'}
                          {deadlineUrgency.level === 'critical' && '⚠️'}
                          <span>{formatDate(filing.deadline)}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>

                    {/* Filed By */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {filing.filedBy || '—'}
                    </td>

                    {/* Actions */}
                    {showActions && (
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (filing.documentUrl) {
                              window.open(filing.documentUrl, '_blank');
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
