/**
 * Billing Dashboard Shell
 *
 * Feature-specific shell for the billing dashboard with optimized Suspense boundaries.
 * Provides streaming SSR support for billing-specific data loading patterns.
 *
 * @module features/billing/shells/DashboardShell
 */

import { Suspense, type ReactNode } from 'react';

interface DashboardShellProps {
  children: ReactNode;
}

/**
 * Billing dashboard loading skeleton
 */
function DashboardSkeleton() {
  return (
    <div className="billing-dashboard-skeleton">
      <div className="skeleton-header" />
      <div className="skeleton-metrics">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
      <div className="skeleton-chart" />
      <div className="skeleton-table" />
    </div>
  );
}

/**
 * Billing Dashboard Shell
 *
 * Wraps billing dashboard with feature-specific Suspense boundary
 * for optimal streaming and loading states.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {children}
    </Suspense>
  );
}
