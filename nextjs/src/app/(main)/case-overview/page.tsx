/**
 * Case Overview Page - Server Component with Data Fetching
 * Enterprise matter management command center
 */
import { CaseOverviewDashboard } from '@/components/case-overview/CaseOverviewDashboard';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Overview | LexiFlow',
  description: 'Enterprise Matter Management Command Center',
};

export default async function CaseOverviewPage() {
  // Fetch all cases for overview
  let cases = [];

  try {
    cases = await apiFetch(API_ENDPOINTS.CASES.LIST);
  } catch (error) {
    console.error('Failed to load cases:', error);
  }

  return (
    <Suspense fallback={<div className="p-8">Loading case overview...</div>}>
      <CaseOverviewDashboard initialCases={cases} />
    </Suspense>
  );
}
