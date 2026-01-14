import { useLoaderData } from 'react-router';
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
    <BillingProvider
      initialInvoices={data.invoices}
      initialTransactions={data.transactions}
      initialRates={data.rates}
      initialTimeEntries={data.timeEntries}
    >
      <BillingView />
    </BillingProvider>
  );
}
