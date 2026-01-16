/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Calendar Route Index
 *
 * Enterprise React Architecture - Calendar Events Management
 * Exports loader and default component for React Router v7
 *
 * @module routes/calendar/index
 */

import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// Import Page component
import { CalendarPage } from './CalendarPage';
import type { CalendarLoaderData } from './loader';

// Export loader
export { calendarLoader as loader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Calendar',
    description: 'Event scheduling and calendar management',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function CalendarIndexRoute() {
  const loaderData = useLoaderData() as CalendarLoaderData;

  return <CalendarPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
