/**
 * Case Analytics Route
 * Detailed analytics for case outcomes, types, and trends
 */

import { useLoaderData } from 'react-router';

import { casesApi } from '@/lib/frontend-api';
import { CaseStatus } from '@/types/enums';

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

import { CaseAnalytics } from '@/routes/analytics/cases/CaseAnalytics';

export function meta() {
  return createMeta({
    title: 'Case Analytics',
    description: 'Case outcomes, win rates, and performance metrics',
  });
}

// Type-safe helper for accessing optional case metadata
// type CaseWithAnalytics = Case & {
//   metadata?: {
//     outcome?: 'Won' | 'Lost' | 'Settled' | 'Dismissed';
//     settlementAmount?: number;
//   };
// };

export async function loader() {
  try {
    // Fetch all cases using new enterprise API with pagination
    const result = await casesApi.getAllCases({ page: 1, limit: 1000 });
    const cases = result.ok ? result.data.data : [];

    // Use CaseStatus enum for type-safe filtering
    const activeCases = cases.filter(c =>
      c.status === CaseStatus.Active ||
      c.status === CaseStatus.Discovery ||
      c.status === CaseStatus.Trial
    );
    const closedCases = cases.filter(c =>
      c.status === CaseStatus.Closed ||
      c.status === CaseStatus.Archived
    );
    // Check outcome in metadata or infer from Settled status
    const wonCases = closedCases.filter(c =>
      c.metadata?.outcome === 'Won' ||
      c.status === CaseStatus.Settled
    );

    const totalCases = cases.length;
    const wonCount = wonCases.length;
    const winRate = closedCases.length > 0 ? (wonCount / closedCases.length) * 100 : 0;

    const durations = closedCases
      .filter(c => c.filingDate && c.closeDate)
      .map(c => {
        const start = new Date(c.filingDate).getTime();
        const end = new Date(c.closeDate).getTime();
        return Math.floor((end - start) / (1000 * 60 * 60 * 24));
      });

    const avgDuration = durations.length > 0
      ? Math.floor(durations.reduce((sum, d) => sum + d, 0) / durations.length)
      : 0;

    const settlements = closedCases
      .filter(c => c.metadata?.settlementAmount)
      .map(c => c.metadata?.settlementAmount ?? 0);

    const avgSettlement = settlements.length > 0
      ? Math.floor(settlements.reduce((sum, s) => sum + s, 0) / settlements.length)
      : 0;

    return {
      metrics: {
        totalCases,
        activeCases: activeCases.length,
        wonCases: wonCount,
        winRate: parseFloat(winRate.toFixed(1)),
        avgDuration,
        avgSettlement,
      },
    };
  } catch (error) {
    console.error('Failed to fetch case analytics:', error);
    return {
      metrics: {
        totalCases: 0,
        activeCases: 0,
        wonCases: 0,
        winRate: 0,
        avgDuration: 0,
        avgSettlement: 0,
      },
    };
  }
}

export default function CaseAnalyticsRoute() {
  const data = useLoaderData();
  return <CaseAnalytics {...data} />;
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Case Analytics"
      message="We couldn't load the analytics data. Please try again."
      backTo="/analytics"
      backLabel="Return to Analytics Dashboard"
    />
  );
}
