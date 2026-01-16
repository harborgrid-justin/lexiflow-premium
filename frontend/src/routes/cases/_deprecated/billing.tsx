/**
 * Case Billing Route
 *
 * Enterprise Pattern:
 * - loader() owns data fetching
 * - Provider owns derivations (totals, budget metrics)
 * - View owns rendering and UI event wiring
 */

import { CaseBillingProvider, type CaseBillingLoaderData } from '@/routes/cases/_billing/CaseBillingProvider';
import { CaseBillingView } from '@/routes/cases/_billing/CaseBillingView';
import { DataService } from '@/services/data/data-service.service';
import { useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
// ============================================================================
// Meta Tags
// ============================================================================
export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  const caseTitle = data?.caseData?.title || 'Case Billing'; return [{ title: `Billing - ${caseTitle} | LexiFlow` }, { name: 'description', content: `View billing and financial information for ${caseTitle}` },];
} // ============================================================================
// Loader
// ============================================================================
export async function loader({ params }: LoaderFunctionArgs): Promise<CaseBillingLoaderData> {
  const { caseId } = params;
  if (!caseId) {
    throw new Response('Case ID is required', { status: 400 });
  }

  const [caseData, timeEntries, invoices, expenses] = await Promise.all([
    DataService.cases.get(caseId),
    DataService.billing.getTimeEntriesByCaseId?.(caseId).catch(() => []),
    DataService.billing.getInvoicesByCaseId?.(caseId).catch(() => []),
    DataService.billing.getExpensesByCaseId?.(caseId).catch(() => []),
  ]);

  if (!caseData) {
    throw new Response('Case Not Found', { status: 404 });
  }

  return {
    caseData,
    timeEntries,
    invoices,
    expenses,
  };
}

// ============================================================================
// Component
// ============================================================================

export default function CaseBillingRoute() {
  const initialData = useLoaderData() as CaseBillingLoaderData;
  return (
    <CaseBillingProvider initialData={initialData}>
      <CaseBillingView />
    </CaseBillingProvider>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================
export function ErrorBoundary({ error }: { error: unknown }) {
  return (<RouteErrorBoundary error={error} title="Failed to Load Billing" message="We couldn't load the billing information for this case." backTo="/cases" backLabel="Back to Cases" onRetry={() => window.location.reload()} />);
}
