/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Profile Route Index
 *
 * Enterprise React Architecture - User Profile Management
 * Exports loader and default component for React Router v7
 *
 * @module routes/profile/index
 */

import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { ProfileLoaderData } from './loader';

// Export loader from dedicated file
export { profileLoader as loader } from './loader';

// Import Page component
import { ProfilePage } from './ProfilePage';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Profile',
    description: 'User profile and account information',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function ProfileRoute() {
  const loaderData = useLoaderData() as ProfileLoaderData;

  return <ProfilePage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
