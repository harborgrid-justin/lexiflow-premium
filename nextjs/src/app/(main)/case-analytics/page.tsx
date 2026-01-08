/**
 * Case Analytics Page
 */

import { PageHeader } from '@/components/layout';
import { Button, Card, CardBody, CardHeader, SkeletonLine, StatCard } from '@/components/ui';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Download, TrendingUp } from 'lucide-react';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Analytics | LexiFlow',
  description: 'Advanced analytics and insights for case management',
};

interface CaseAnalytics {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  winRate: number;
  averageResolutionTime: number;
}

async function CaseStatsContent() {
  let stats: CaseAnalytics | null = null;
  let error = null;

  try {
    const response = await apiFetch(API_ENDPOINTS.ANALYTICS?.CASES || '/api/analytics/cases');
    stats = (response as CaseAnalytics) || null;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load case analytics';
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
      <StatCard title="Total Cases" value={String(stats.totalCases)} subtitle="All time" />
      <StatCard title="Active" value={String(stats.activeCases)} subtitle="In progress" />
      <StatCard title="Closed" value={String(stats.closedCases)} subtitle="Completed" />
      <StatCard title="Win Rate" value={`${stats.winRate}%`} subtitle="Success rate" />
      <StatCard title="Avg Resolution" value={`${stats.averageResolutionTime}d`} subtitle="Days" />
    </div>
  );
}

export default function CaseAnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Case Analytics"
        description="Analyze case performance and outcomes"
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Analytics' }]}
        actions={<Button icon={<Download className="h-4 w-4" />}>Export Data</Button>}
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
        <CaseStatsContent />
      </Suspense>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Case Trends</h3>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-900/50 rounded">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400">Chart visualization coming soon</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}
