/**
 * Billing Analytics Route
 * Revenue, realization, collection rates, AR aging, and WIP reports
 *
 * Enterprise API Pattern:
 * - Uses @/lib/frontend-api/billing for data fetching
 * - Handles Result<T> returns
 * - Graceful error handling with fallbacks
 */

import { BillingAnalytics } from '@/routes/analytics/billing/BillingAnalytics';
import { useLoaderData } from 'react-router';
import { createMeta } from '../_shared/meta-utils';

export function meta() {
  return createMeta({
    title: 'Billing Analytics',
    description: 'Revenue, realization, and collection metrics',
  });
}

export async function loader() {
  try {
    // Fetch billing data using new enterprise API
    const timeEntriesResult = await billingApi.getAllTimeEntries({ page: 1, limit: 1000 });
    const invoicesResult = await billingApi.getAllInvoices({ page: 1, limit: 1000 });

    const timeEntries = timeEntriesResult.ok ? timeEntriesResult.data.data : [];
    const invoices = invoicesResult.ok ? invoicesResult.data.data : [];

    // Calculate billing metrics
    const totalBilled = timeEntries.reduce((sum: number, entry: any) => {
      const rate = entry.rate || 0;
      const hours = entry.hours || 0;
      return sum + (rate * hours);
    }, 0);

    const paidInvoices = invoices.filter((inv: any) => inv.status === 'paid');
    const totalCollected = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);

    const pendingInvoices = invoices.filter((inv: any) => inv.status === 'sent' || inv.status === 'overdue');
    const outstandingAR = pendingInvoices.reduce((sum: number, inv: any) => sum + (inv.amount || 0), 0);

    const realizationRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

    // Calculate collection days
    const collectedInvoices = invoices.filter((inv: any) => inv.status === 'paid' && inv.paidDate);
    const collectionDays = collectedInvoices.map((inv: any) => {
      if (!inv.createdAt || !inv.paidDate) return 0;
      const issued = new Date(inv.createdAt).getTime();
      const paid = new Date(inv.paidDate).getTime();
      return Math.floor((paid - issued) / (1000 * 60 * 60 * 24));
    });

    const avgDaysToCollect = collectionDays.length > 0
      ? Math.floor(collectionDays.reduce((sum: number, d: number) => sum + d, 0) / collectionDays.length)
      : 0;

    // Calculate WIP
    const wipEntries = timeEntries.filter((entry: { invoiceId?: string }) => !entry.invoiceId);
    const wipTotal = wipEntries.reduce((sum: number, entry: { rate?: number; hours?: number }) => {
      const rate = entry.rate || 0;
      const hours = entry.hours || 0;
      return sum + (rate * hours);
    }, 0);

    return {
      metrics: {
        totalRevenue: totalBilled,
        collectedRevenue: totalCollected,
        outstandingAR,
        realizationRate: parseFloat(realizationRate.toFixed(1)),
        collectionRate: totalBilled > 0 ? parseFloat(((totalCollected / totalBilled) * 100).toFixed(1)) : 0,
        wipTotal,
        avgDaysToCollect,
      },
    };
  } catch (error) {
    console.error('Failed to fetch billing analytics:', error);
    return {
      metrics: {
        totalRevenue: 0,
        collectedRevenue: 0,
        outstandingAR: 0,
        realizationRate: 0,
        collectionRate: 0,
        wipTotal: 0,
        avgDaysToCollect: 0,
      },
    };
  }
}

export default function BillingAnalyticsRoute() {
  const data = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  return <BillingAnalytics {...data} />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Billing Analytics"
      message="We couldn't load the billing analytics data. Please try again."
      backTo="/analytics"
      backLabel="Back to Analytics"
    />
  );
}
