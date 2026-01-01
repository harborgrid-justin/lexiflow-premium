/**
 * CaseHeader Component
 *
 * Displays case header with title, status, and quick actions.
 * Used at the top of case detail pages.
 *
 * @module components/features/cases/CaseHeader
 */

import type { Case } from '@/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';
import { CaseStatusBadge } from '../CaseStatusBadge';
import { CaseQuickActions } from '../CaseQuickActions';

export interface CaseHeaderProps {
  /** The case data to display */
  case: Case;
  /** Optional back navigation link */
  backTo?: string;
  /** Optional action handlers */
  onEdit?: (caseData: Case) => void;
  onDelete?: (caseData: Case) => void;
  onArchive?: (caseData: Case) => void;
  onShare?: (caseData: Case) => void;
  /** Show breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Format date for display
 */
function formatDate(date: string | undefined): string {
  if (!date) return 'N/A';
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}

/**
 * CaseHeader component displays case header with title, status, and actions
 */
export function CaseHeader({
  case: caseData,
  backTo = '/cases',
  onEdit,
  onDelete,
  onArchive,
  onShare,
  showBreadcrumbs = true,
  className,
}: CaseHeaderProps) {
  return (
    <div className={cn('border-b bg-white dark:bg-gray-800 dark:border-gray-700', className)}>
      <div className="px-6 py-4">
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <nav className="mb-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Link
              to={backTo}
              className="hover:text-gray-900 dark:hover:text-gray-200"
            >
              Cases
            </Link>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {caseData.caseNumber || 'Case Details'}
            </span>
          </nav>
        )}

        {/* Header Content */}
        <div className="flex items-start justify-between gap-4">
          {/* Left Section: Title & Metadata */}
          <div className="min-w-0 flex-1">
            {/* Case Number & Status */}
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {caseData.caseNumber || 'No Case Number'}
              </span>
              <CaseStatusBadge status={caseData.status} showIcon />
              {caseData.isArchived && (
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  📦 Archived
                </span>
              )}
            </div>

            {/* Case Title */}
            <h1 className="mb-3 text-2xl font-bold text-gray-900 dark:text-white">
              {caseData.title}
            </h1>

            {/* Quick Info Grid */}
            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
              {/* Client */}
              <div className="flex items-center gap-2 text-sm">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Client: </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {caseData.client || 'Unknown'}
                  </span>
                </div>
              </div>

              {/* Court */}
              {caseData.court && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Court: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {caseData.court}
                    </span>
                  </div>
                </div>
              )}

              {/* Filing Date */}
              {caseData.filingDate && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Filed: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatDate(caseData.filingDate)}
                    </span>
                  </div>
                </div>
              )}

              {/* Matter Type */}
              {caseData.matterType && (
                <div className="flex items-center gap-2 text-sm">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {caseData.matterType}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Description (if exists) */}
            {caseData.description && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {caseData.description}
              </p>
            )}
          </div>

          {/* Right Section: Actions */}
          <div className="flex items-start gap-2">
            <CaseQuickActions
              case={caseData}
              onEdit={onEdit}
              onDelete={onDelete}
              onArchive={onArchive}
              onShare={onShare}
            />
          </div>
        </div>

        {/* Warning Badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Statute of Limitations Warning */}
          {caseData.solDate && new Date(caseData.solDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) && (
            <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">Statute of Limitations: {formatDate(caseData.solDate)}</span>
            </div>
          )}

          {/* Trial Date Warning */}
          {caseData.trialDate && new Date(caseData.trialDate) > new Date() && (
            <div className="flex items-center gap-2 rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Trial Date: {formatDate(caseData.trialDate)}</span>
            </div>
          )}

          {/* Budget Alert */}
          {caseData.budgetAlertThreshold && caseData.billingValue &&
           caseData.budget &&
           (caseData.billingValue / caseData.budget.amount) > (caseData.budgetAlertThreshold / 100) && (
            <div className="flex items-center gap-2 rounded-md bg-yellow-50 px-3 py-2 text-sm text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Budget Alert: {caseData.budgetAlertThreshold}% threshold reached</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
