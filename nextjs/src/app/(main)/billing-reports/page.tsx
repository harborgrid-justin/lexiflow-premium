/**
 * Billing Reports Page - Server Component
 * Financial reporting and billing analytics
 *
 * ENTERPRISE GUIDELINES COMPLIANCE:
 * - [✓] Guideline 1: Default export for /billing-reports route
 * - [✓] Guideline 2: Server Component by default
 * - [✓] Guideline 5: Data fetching isolated in async components
 * - [✓] Guideline 7: SEO metadata export
 * - [✓] Guideline 11: Suspense for loading states
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody, CardHeader, SkeletonLine, StatCard } from '@/components/ui';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { BarChart3, Download } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Billing Reports | LexiFlow',
  description: 'Financial reporting and billing analytics for law firm operations',
};

interface BillingStats {
  totalBilled: number;
  totalCollected: number;
  outstandingBalance: number;
  billableHours: number;
  averageRate: number;
}

async function BillingStatsContent() {
  let stats: BillingStats | null = null;
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.ANALYTICS?.BILLING || '/api/analytics/billing');
    stats = (response as BillingStats) || null;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load billing stats';
  }

  if (error || !stats) {
    return (
      <Card>
        <CardBody>
          <p className="text-red-600 dark:text-red-400">Error: {error || 'No data available'}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-6 mb-8">
      <StatCard title="Total Billed" value={`$${stats.totalBilled}`} subtitle="All time" />
      <StatCard title="Collected" value={`$${stats.totalCollected}`} subtitle="Received" />
      <StatCard title="Outstanding" value={`$${stats.outstandingBalance}`} subtitle="Due" />
      <StatCard title="Billable Hours" value={`${stats.billableHours}h`} subtitle="Logged" />
      <StatCard title="Avg Rate" value={`$${stats.averageRate}`} subtitle="Per hour" />
    </div>
  );
}

export default function BillingReportsPage() {
  return (
    <>
      <PageHeader
        title="Billing Reports"
        description="View billing analytics and financial reports"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Reports' }]}
        actions={<Button icon={<Download className="h-4 w-4" />}>Export Report</Button>}
      />

      <Suspense
        fallback={
          <div className="grid grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardBody>
                  <SkeletonLine lines={2} className="h-12" />
                </CardBody>
              </Card>
            ))}
          </div>
        }
      >
        <BillingStatsContent />
      </Suspense>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Billing Breakdown</h3>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-900/50 rounded">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400">Chart visualization coming soon</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
