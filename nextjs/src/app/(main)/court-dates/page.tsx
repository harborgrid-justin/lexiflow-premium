/**
 * Court Dates Page - Server Component with Data Fetching
 * Displays upcoming court hearings with calendar and list views
 */
import { CourtDatesList } from '@/components/court-dates/CourtDatesList';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Court Dates',
  description: 'Manage court hearings and calendar',
};

export default async function CourtDatesPage() {
  // Fetch initial court dates from backend
  let courtDates = [];

  try {
    const data = await apiFetch(API_ENDPOINTS.COURT_DATES.LIST).catch(() => ({ data: [] })) as any;
    courtDates = data?.data || [];
  } catch (error) {
    console.error('Failed to load court dates:', error);
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<div className="p-8">Loading court dates...</div>}>
        <CourtDatesList initialCourtDates={courtDates} />
      </Suspense>
    </div>
  );
}
