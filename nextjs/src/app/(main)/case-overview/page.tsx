/**
 * Case Overview Page - Server Component with Data Fetching
 * Enterprise matter management command center
 */
import React from 'react';
import { CaseOverviewDashboard } from '@/components/case-overview/CaseOverviewDashboard';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Overview | LexiFlow',
  description: 'Enterprise Matter Management Command Center',
};

export default async function CaseOverviewPage(): Promise<React.JSX.Element> {
  // Fetch all cases for overview
  let cases = [];

  try {
    cases = await apiFetch(API_ENDPOINTS.CASES.LIST);
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <Suspense fallback={<div className="p-8">Loading case overview...</div>}>
      <CaseOverviewDashboard initialCases={cases} />
    </Suspense>
  );
}
