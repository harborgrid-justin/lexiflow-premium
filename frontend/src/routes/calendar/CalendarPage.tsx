/**
 * Calendar & Scheduling Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { useLoaderData } from 'react-router';
import { CalendarProvider } from './CalendarProvider';
import { CalendarView } from './CalendarView';
import type { CalendarLoaderData } from './loader';

export function CalendarPage() {
  const initialData = useLoaderData() as CalendarLoaderData;

  return (
    <CalendarProvider initialData={initialData}>
      <CalendarView />
    </CalendarProvider>
  );
}

export default CalendarPage;
