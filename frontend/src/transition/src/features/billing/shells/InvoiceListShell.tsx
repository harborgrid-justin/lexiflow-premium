/**
 * Billing Invoice List Shell
 *
 * Feature-specific shell for the invoice list with optimized Suspense boundaries.
 * Handles streaming for large invoice datasets.
 *
 * @module features/billing/shells/InvoiceListShell
 */

import { Suspense, type ReactNode } from 'react';

interface InvoiceListShellProps {
  children: ReactNode;
}

/**
 * Invoice list loading skeleton
 */
function InvoiceListSkeleton() {
  return (
    <div className="invoice-list-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-search" />
        <div className="skeleton-filters" />
      </div>
      <div className="skeleton-table">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="skeleton-row" />
        ))}
      </div>
    </div>
  );
}

/**
 * Invoice List Shell
 *
 * Wraps invoice list with feature-specific Suspense boundary
 * for optimal streaming and loading states.
 */
export function InvoiceListShell({ children }: InvoiceListShellProps) {
  return (
    <Suspense fallback={<InvoiceListSkeleton />}>
      {children}
    </Suspense>
  );
}
