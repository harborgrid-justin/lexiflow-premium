/**
 * DAF Operations Index Route
 *
 * Data Access Framework operations management including
 * security policies, data sources, and access keys.
 *
 * @module routes/daf/index
 */

import { DafDashboard } from '@/features/operations/daf/DafDashboard';
import { DataService } from '@/services/data/dataService';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'DAF Operations',
    count: data?.stats?.accessPolicies,
    description: 'Manage Data Access Framework operations and security',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  try {
    const policies = await DataService.security.getSecurityPolicies();

    // In a real implementation, we would fetch these from their respective services
    // For now, we'll use the policies count and placeholders
    const stats = {
      dataSources: 0, // Placeholder until Data Source service is available
      accessPolicies: Array.isArray(policies) ? policies.length : 0,
      activeKeys: 0 // Placeholder until Key Management service is available
    };

    return { stats };
  } catch (error) {
    console.error("Failed to load DAF data", error);
    return {
      stats: {
        dataSources: 0,
        accessPolicies: 0,
        activeKeys: 0
      }
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create-policy":
      // TODO: Handle policy creation via DataService.security
      return { success: true, message: "Policy created successfully" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DAFIndexRoute({ loaderData }: Route.ComponentProps) {
  return <DafDashboard stats={loaderData.stats} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load DAF Operations"
      message="We couldn't load the DAF data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
