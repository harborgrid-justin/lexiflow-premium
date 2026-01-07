/**
 * Reporting Dashboard Shell
 *
 * Feature-specific shell for the reporting dashboard with optimized Suspense boundaries.
 * Provides streaming SSR support for analytics and report data.
 *
 * @module features/reporting/shells/DashboardShell
 */

import { Suspense, type ReactNode } from 'react';

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Reporting dashboard loading skeleton
 */
function DashboardSkeleton() {
  return (
    <div className="reporting-dashboard-skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-filters">
        <div className="skeleton-date-range" />
        <div className="skeleton-dropdown" />
      </div>
      <div className="skeleton-charts">
        <div className="skeleton-chart large" />
        <div className="skeleton-chart medium" />
        <div className="skeleton-chart medium" />
      </div>
      <div className="skeleton-insights" />
    </div>
  );
}

/**
 * Reporting Dashboard Shell
 *
 * Wraps reporting dashboard with feature-specific Suspense boundary
 * for optimal streaming and loading states.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {children}
    </Suspense>
  );
}
