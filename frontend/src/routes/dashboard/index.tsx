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

import { dashboardRoute } from './route';

export { dashboardRoute as default };
export { loader } from './loader';
export { ErrorBoundary } from './errors';
export { meta } from './route';
