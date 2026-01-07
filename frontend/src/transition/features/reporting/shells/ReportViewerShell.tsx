/**
 * Reporting Report Viewer Shell
 *
 * Feature-specific shell for the report viewer with optimized Suspense boundaries.
 * Handles streaming for large report datasets with charts and tables.
 *
 * @module features/reporting/shells/ReportViewerShell
 */

import { Suspense, type ReactNode } from 'react';

interface ReportViewerShellProps {
  children: ReactNode;
}

/**
 * Report viewer loading skeleton
 */
function ReportViewerSkeleton() {
  return (
    <div className="report-viewer-skeleton">
      <div className="skeleton-toolbar">
        <div className="skeleton-title" />
        <div className="skeleton-actions" />
      </div>
      <div className="skeleton-content">
        <div className="skeleton-summary" />
        <div className="skeleton-visualization large" />
        <div className="skeleton-data-table" />
      </div>
    </div>
  );
}

/**
 * Report Viewer Shell
 *
 * Wraps report viewer with feature-specific Suspense boundary
 * for optimal streaming and loading states.
 */
export function ReportViewerShell({ children }: ReportViewerShellProps) {
  return (
    <Suspense fallback={<ReportViewerSkeleton />}>
      {children}
    </Suspense>
  );
}
