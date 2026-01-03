/**
 * Discovery Index Route
 *
 * Comprehensive e-discovery platform including legal holds, collections,
 * processing, review, productions, and privilege logging.
 *
 * @module routes/discovery/index
 */

import React from 'react';
import { useNavigate } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Discovery',
    count: data?.items?.length,
    description: 'Manage legal discovery processes and requests',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement discovery data fetching
  // const url = new URL(request.url);
  // const caseId = url.searchParams.get("caseId");
  // const discovery = await api.discovery.list({ caseId });

  return { items: [], totalCount: 0 };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // TODO: Handle discovery request creation
      return { success: true, message: "Discovery request created" };
    case "delete":
      // TODO: Handle discovery request deletion
      return { success: true, message: "Discovery request deleted" };
    case "respond":
      // TODO: Handle discovery response
      return { success: true, message: "Response recorded" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DiscoveryIndexRoute() {
  const navigate = useNavigate();
console.log('useNavigate:', navigate);

  // Import the DiscoveryPlatform component dynamically
  const DiscoveryPlatform = React.lazy(() =>
    import('@/features/litigation/discovery/DiscoveryPlatform')
  );

  return (
    <div className="h-full">
      <React.Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading Discovery Platform...</p>
          </div>
        </div>
      }>
        <DiscoveryPlatform initialTab="dashboard" />
      </React.Suspense>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Discovery"
      message="We couldn't load the discovery data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
