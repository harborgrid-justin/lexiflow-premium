/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Billing Index Route
 *
 * Enterprise React Architecture - Billing and Finance
 * Exports loader and default component for React Router v7
 *
 * @module routes/billing/index
 */

import { Suspense } from 'react';
import { Await, useLoaderData, useRevalidator } from 'react-router';

import { createListMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';


// Import standard components
import { BillingProvider } from './BillingProvider';
import { BillingView } from './BillingView';

import type { Route } from "./+types/index";
import type { clientLoader } from './loader';

// Export loader and action
export { clientLoader as loader, action } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta(_args: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Billing',
    description: 'Manage invoices, payments, and financial reports',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function BillingIndexRoute() {
  const initialData = useLoaderData() as typeof clientLoader;
  const revalidator = useRevalidator();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Billing" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load billing" />}>
        {(resolved) => (
          <BillingProvider
            initialInvoices={resolved.invoices}
            initialTransactions={resolved.transactions}
            initialRates={resolved.rates}
            initialTimeEntries={resolved.timeEntries}
            onRevalidate={revalidator.revalidate}
          >
            <BillingView />
          </BillingProvider>
        )}
      </Await>
    </Suspense>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
