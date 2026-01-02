/**
 * Billing Page - Server Component with Data Fetching
 * Fetches billing data on server, passes to client component
 */
import BillingDashboard from '@/components/billing/BillingDashboard';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Billing & Finance | LexiFlow',
  description: 'Manage invoices, track time, and monitor financial health',
};

// Server Component - fetch data on server
export default async function BillingPage(): Promise<JSX.Element> {
  // Fetch billing metrics from backend
  let metrics = null;
  try {
    metrics = await apiFetch(API_ENDPOINTS.BILLING.METRICS);
  } catch (error) {
    console.error('Failed to load billing metrics:', error);
    // Fallback to null, component will handle
  }

  return (
    <Suspense fallback={<div className="p-8">Loading billing data...</div>}>
      <BillingDashboard initialMetrics={metrics} />
    </Suspense>
  );
}
