/**
 * Case Analytics Page - Server Component with Data Fetching
 * Fetches case analytics from backend
 */
import { CaseAnalytics } from '@/components/case-analytics/CaseAnalytics';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Case Analytics | LexiFlow',
  description: 'Advanced case analytics and insights',
};

export default async function CaseAnalyticsPage(): Promise<JSX.Element> {
  // Fetch analytics data
  let analyticsData = null;

  try {
    analyticsData = await apiFetch(API_ENDPOINTS.ANALYTICS.CASES);
  } catch (error) {
    console.error('Failed to load case analytics:', error);
  }

  return (
    <Suspense fallback={<div className="p-8">Loading analytics...</div>}>
      <CaseAnalytics initialData={analyticsData} />
    </Suspense>
  );
}
