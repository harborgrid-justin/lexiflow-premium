/**
 * Calendar Route Index
 * 
 * Enterprise React Architecture - Calendar Events Management
 * Exports loader and default component for React Router v7
 * 
 * @module routes/calendar/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// Export loader from dedicated file
export { calendarLoader as loader } from './loader';

// Import Page component
import { CalendarPage } from './CalendarPage';

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

export default function CalendarRoute() {
  return <CalendarPage />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
