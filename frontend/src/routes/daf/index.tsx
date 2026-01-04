/**
 * DAF Operations Index Route
 *
 * Donor-Advised Fund operations management including
 * grant tracking, fund administration, and compliance.
 *
 * @module routes/daf/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'DAF Operations',
    count: data?.items?.length,
    description: 'Manage Donor-Advised Fund operations and grants',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement DAF data fetching
  // const funds = await api.daf.getFunds();
  // const grants = await api.daf.getGrants();

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
      // TODO: Handle fund/grant creation
      return { success: true, message: "Created successfully" };
    case "delete":
      // TODO: Handle fund/grant deletion
      return { success: true, message: "Deleted successfully" };
    case "approve":
      // TODO: Handle grant approval
      return { success: true, message: "Grant approved" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { DafDashboard } from '@/features/operations/daf/DafDashboard';

export default function DAFIndexRoute() {
  return <DafDashboard />;
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
