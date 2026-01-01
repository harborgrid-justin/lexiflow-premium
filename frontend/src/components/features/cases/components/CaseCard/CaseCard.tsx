/**
 * CaseCard Component
 *
 * Displays a case summary in a card format for grid/list views.
 * Supports different layouts and interactive features.
 *
 * @module components/features/cases/CaseCard
 */

import type { Case } from '@/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { CaseStatusBadge } from '../CaseStatusBadge';
import { formatDistanceToNow } from 'date-fns';

export interface CaseCardProps {
  /** The case data to display */
  case: Case;
  /** Layout variant */
  variant?: 'grid' | 'list';
  /** Optional click handler */
  onClick?: (caseData: Case) => void;
  /** Show quick actions menu */
  showActions?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Format currency for display
 */
function formatCurrency(amount: number | undefined): string {
  if (!amount) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(date: string | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get relative time from date
 */
function getRelativeTime(date: string | undefined): string {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * CaseCard component displays case information in a card format
 */
export function CaseCard({
  case: caseData,
  variant = 'grid',
  onClick,
  showActions = false,
  className,
}: CaseCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(caseData);
    }
  };

  const CardWrapper = onClick ? 'div' : Link;
  const wrapperProps = onClick
    ? { onClick: handleClick, role: 'button', tabIndex: 0 }
    : { to: `/cases/${caseData.id}` };

  const isGridVariant = variant === 'grid';

  return (
    <CardWrapper
      {...wrapperProps}
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md dark:bg-gray-800 dark:border-gray-700',
        onClick && 'cursor-pointer',
        isGridVariant ? 'flex flex-col' : 'flex items-center gap-4 p-4',
        className
      )}
    >
      {/* Header Section */}
      <div className={cn('flex items-start justify-between gap-3', isGridVariant && 'p-4 pb-3')}>
        <div className="min-w-0 flex-1">
          {/* Case Number */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {caseData.caseNumber || 'No Number'}
            </span>
            {caseData.isArchived && (
              <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                Archived
              </span>
            )}
          </div>

          {/* Case Title */}
          <h3 className="truncate text-base font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {caseData.title}
          </h3>

          {/* Client Name */}
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {caseData.client || 'Unknown Client'}
          </p>
        </div>

        {/* Status Badge */}
        <CaseStatusBadge status={caseData.status} size="sm" />
      </div>

      {/* Details Section */}
      <div className={cn('space-y-2', isGridVariant ? 'px-4' : 'flex-1')}>
        {/* Matter Type & Practice Area */}
        <div className="flex flex-wrap gap-1.5">
          {caseData.matterType && (
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {caseData.matterType}
            </span>
          )}
          {caseData.practiceArea && caseData.practiceArea !== caseData.matterType && (
            <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
              {caseData.practiceArea}
            </span>
          )}
        </div>

        {/* Court & Jurisdiction */}
        {(caseData.court || caseData.jurisdiction) && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="truncate">
              {caseData.court || caseData.jurisdiction}
            </span>
          </div>
        )}

        {/* Lead Attorney */}
        {caseData.leadAttorneyId && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="truncate">Lead Attorney: {caseData.leadAttorneyId}</span>
          </div>
        )}

        {/* Filing Date */}
        {caseData.filingDate && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Filed: {formatDate(caseData.filingDate)}</span>
          </div>
        )}

        {/* Trial Date (if upcoming) */}
        {caseData.trialDate && (
          <div className="flex items-center gap-1.5 text-xs font-medium text-orange-600 dark:text-orange-400">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Trial: {formatDate(caseData.trialDate)}</span>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className={cn(
        'flex items-center justify-between border-t pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400',
        isGridVariant && 'px-4 pb-4 mt-3'
      )}>
        <div className="flex items-center gap-3">
          {/* Value */}
          {(caseData.value || caseData.billingValue) && (
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatCurrency(caseData.value || caseData.billingValue)}
            </span>
          )}

          {/* Parties count */}
          {caseData.parties && caseData.parties.length > 0 && (
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {caseData.parties.length}
            </span>
          )}
        </div>

        {/* Last updated */}
        <span className="text-xs" title={caseData.updatedAt}>
          {getRelativeTime(caseData.updatedAt)}
        </span>
      </div>

      {/* Quick Actions (if enabled) */}
      {showActions && (
        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle quick actions
            }}
            className="rounded-full bg-white p-1.5 shadow-sm hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
            aria-label="Quick actions"
          >
            <svg className="h-4 w-4 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      )}
    </CardWrapper>
  );
}
