/**
 * Admin Dashboard Shell
 *
 * Feature-specific shell for the admin dashboard with optimized Suspense boundaries.
 * Provides streaming SSR support for administrative data and system metrics.
 *
 * @module features/admin/shells/DashboardShell
 */

import { Suspense, type ReactNode } from 'react';

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Admin dashboard loading skeleton
 */
function DashboardSkeleton() {
  return (
    <div className="admin-dashboard-skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-system-metrics">
        <div className="skeleton-metric-card" />
        <div className="skeleton-metric-card" />
        <div className="skeleton-metric-card" />
        <div className="skeleton-metric-card" />
      </div>
      <div className="skeleton-activity-feed" />
      <div className="skeleton-quick-actions" />
    </div>
  );
}

/**
 * Admin Dashboard Shell
 *
 * Wraps admin dashboard with feature-specific Suspense boundary
 * for optimal streaming and loading states.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {children}
    </Suspense>
  );
}
