/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Calendar Page Component
 *
 * Handles Suspense/Await wiring for calendar route
 * Receives loader data and passes to Provider → View
 *
 * @module routes/calendar/CalendarPage
 */

import { Suspense } from 'react';
import { Await } from 'react-router';
import { RouteError, RouteSkeleton } from '../_shared/RouteSkeletons';
import { CalendarProvider } from './CalendarProvider';
import { CalendarView } from './CalendarView';
import type { CalendarLoaderData } from './loader';

interface CalendarPageProps {
  loaderData: CalendarLoaderData;
}

export function CalendarPage({ loaderData }: CalendarPageProps) {
  return (
    <Suspense fallback={<RouteSkeleton title="Loading Calendar" />}>
      <Await resolve={loaderData} errorElement={<RouteError title="Failed to load Calendar" />}>
        {(resolved) => (
          <CalendarProvider initialData={resolved}>
            <CalendarView />
          </CalendarProvider>
        )}
      </Await>
    </Suspense>
  );
}
