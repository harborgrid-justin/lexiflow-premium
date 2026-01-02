/**
 * Case Calendar Page - Server Component with Data Fetching
 * Calendar view of case events and deadlines
 */
import React from 'react';
import { CaseCalendar } from '@/components/case-calendar/CaseCalendar';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Calendar | LexiFlow',
  description: 'Case events and deadlines calendar',
};

export default async function CaseCalendarPage(): Promise<React.JSX.Element> {
  // Fetch calendar events
  let events = [];

  try {
    events = await apiFetch(API_ENDPOINTS.CALENDAR.EVENTS);
  } catch (error) {
    console.error('Failed to load calendar events:', error);
  }

  return (
    <Suspense fallback={<div className="p-8">Loading calendar...</div>}>
      <CaseCalendar initialEvents={events} />
    </Suspense>
  );
}
