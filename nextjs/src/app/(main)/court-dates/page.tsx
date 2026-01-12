/**
 * Court Dates Page - Server Component with Data Fetching
 * Displays upcoming court hearings with calendar and list views
 */
import React from 'react';
import { CourtDatesList } from '@/components/court-dates/CourtDatesList';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Court Dates',
  description: 'Manage court hearings and calendar',
};

export default async function CourtDatesPage(): Promise<React.JSX.Element> {
  // Fetch initial court dates from backend
  let courtDates = [];

  try {
    const data = await apiFetch(API_ENDPOINTS.COURT_DATES.LIST).catch(() => ({ data: [] })) as any;
    courtDates = data?.data || [];
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<div className="p-8">Loading court dates...</div>}>
        <CourtDatesList initialCourtDates={courtDates} />
      </Suspense>
    </div>
  );
}
