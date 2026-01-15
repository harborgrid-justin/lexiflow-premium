/**
 * Dashboard Route Index
 * Enterprise React Architecture
 *
 * @module routes/dashboard/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import { DashboardPageContent } from './DashboardPage';
import { clientLoader } from './loader';

// Export client-side loader (must be named 'clientLoader' for React Router v7)
export { clientLoader };

// Export Error Boundary
export { RouteErrorBoundary as ErrorBoundary };

// Export Meta
export function meta() {
  return createMeta({
    title: 'Command Center',
    description: 'Overview of cases, tasks, and deadlines',
  });
}

// Export Default Component
export default DashboardPageContent;
