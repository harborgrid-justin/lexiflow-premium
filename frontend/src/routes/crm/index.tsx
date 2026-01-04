/**
 * Client CRM Route
 *
 * Client relationship management with:
 * - Server-side data loading via loader
 * - Client search and filtering
 * - Contact management
 * - Client intake actions
 *
 * @module routes/crm/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Clients',
    count: data?.clients?.length,
    description: 'Manage client relationships and contacts',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement client data fetching
  // const [clients, recentActivity] = await Promise.all([
  //   api.crm.getClients(),
  //   api.crm.getRecentActivity(),
  // ]);

  return {
    clients: [],
    recentActivity: [],
    totalCount: 0,
  };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "add-client":
      // TODO: Handle client creation
      return { success: true, message: "Client added" };

    case "update-contact":
      // TODO: Handle contact update
      return { success: true, message: "Contact updated" };

    case "archive":
      // TODO: Handle client archival
      return { success: true, message: "Client archived" };

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { ClientCRM } from '@/features/operations/crm/ClientCRM';

export default function CRMIndexRoute() {
  return <ClientCRM />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load CRM"
      message="We couldn't load the client data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
