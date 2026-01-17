/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Settings Route Index
 *
 * Enterprise React Architecture - System Settings
 * Exports loader and default component for React Router v7
 *
 * @module routes/settings/index
 */

import { useLoaderData } from 'react-router';

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// Import Page component
import { SettingsPage } from './SettingsPage';

import type { SettingsLoaderData } from './loader';

// Export loader from dedicated file
export { settingsLoader as clientLoader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Settings',
    description: 'System configuration and preferences',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function SettingsIndexRoute() {
  const loaderData = useLoaderData();

  return <SettingsPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
