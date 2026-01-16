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

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';

// Export loader from dedicated file
export { settingsLoader as loader } from './loader';

// Import Page component
import { SettingsPage } from './SettingsPage';

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

export default function SettingsRoute() {
  return <SettingsPage />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
