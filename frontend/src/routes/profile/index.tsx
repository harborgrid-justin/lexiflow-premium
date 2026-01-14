/**
 * Profile Route Index
 * 
 * Enterprise React Architecture - User Profile Management
 * Exports loader and default component for React Router v7
 * 
 * @module routes/profile/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

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
  return <ProfilePage />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
