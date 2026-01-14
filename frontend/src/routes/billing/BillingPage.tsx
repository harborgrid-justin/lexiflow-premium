import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { BillingProvider } from './BillingProvider';
import { BillingView } from './BillingView';
import type { clientLoader } from './loader';

/**
 * Billing Page - Data Orchestration Layer
 *
 * Responsibilities:
 * - Consume loader data
 * - Initialize provider with data
 * - Delegate rendering to View
 */
export function BillingPageContent() {
  const data = useLoaderData<typeof clientLoader>();

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Billing" />}>
      <Await resolve={data} errorElement={<RouteError title="Failed to load billing" />}>
        {(resolved) => (
          <BillingProvider
            initialInvoices={resolved.invoices}
            initialTransactions={resolved.transactions}
            initialRates={resolved.rates}
            initialTimeEntries={resolved.timeEntries}
          >
            <BillingView />
          </BillingProvider>
        )}
      </Await>
    </Suspense>
  );
}
