/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Calendar & Scheduling Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { CalendarProvider } from './CalendarProvider';
import { CalendarView } from './CalendarView';
import type { CalendarLoaderData } from './loader';

export function CalendarPage() {
  const initialData = useLoaderData() as CalendarLoaderData;

  return (
    <Suspense fallback={<RouteSkeleton title="Loading Calendar" />}>
      <Await resolve={initialData} errorElement={<RouteError title="Failed to load Calendar" />}>
        {(resolved) => (
          <CalendarProvider initialData={resolved}>
            <CalendarView />
          </CalendarProvider>
        )}
      </Await>
    </Suspense>
  );
}

export default CalendarPage;
