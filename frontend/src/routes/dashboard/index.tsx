/**
 * ================================================================================
 * DASHBOARD ROUTE INDEX - LAZY LOAD EXPORTS
 * ================================================================================
 *
 * This file is the entry point for React Router's lazy loading.
 * It exports all required route components and functions.
 *
 * REQUIRED EXPORTS:
 * - loader or clientLoader: Data fetching function
 * - default: Route component
 * - ErrorBoundary: Error handling component
 * - meta: Page metadata function
 *
 * ENTERPRISE PATTERN:
 * Each route exports its own loader, component, error boundary, and metadata.
 * Router lazy loads this file only when route is accessed.
 *
 * @module routes/dashboard/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import { DashboardPageContent } from './DashboardPage';
import { clientLoader, loader } from './loader';

/**
 * Export Loaders
 * - clientLoader: Client-side data fetching
 * - loader: Server-side data fetching (SSR)
 */
export { clientLoader, loader };

/**
 * Export Default Component
 * Must be default export for React Router lazy loading
 */
export default DashboardPageContent;

/**
 * Export Error Boundary
 * Catches errors within this route
 */
export { RouteErrorBoundary as ErrorBoundary };

/**
 * Export Meta Function
 * Provides page metadata (title, description, etc.)
 */
export function meta() {
  return createMeta({
    title: 'Command Center',
    description: 'Overview of cases, tasks, and deadlines',
  });
}
