/**
 * Client Detail Route
 *
 * Displays detailed information for a single client.
 *
 * @module routes/crm/client-detail
 */

import type { Client } from '@/types';
import { useNavigate } from 'react-router';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createDetailMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/client-detail";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  const item = (data as { item: Client } | undefined)?.item;
  return createDetailMeta({
    entityType: 'Client',
    entityName: item?.name ?? 'Unknown Client',
    entityId: item?.id ?? 'unknown',
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function loader({ params }: Route.LoaderArgs) {
  const { clientId } = params;

  // CRITICAL: Validate param exists
  if (!clientId) {
    throw new Response("Client ID is required", { status: 400 });
  }

  // TODO: Fetch data
  // const item = await api.crm.clients.get(clientId);
  // if (!item) {
  //   throw new Response("Client not found", { status: 404 });
  // }

  return { item: null as { id: string; name: string } | null };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: Route.ActionArgs) {
  const { clientId } = params;

  if (!clientId) {
    return { success: false, error: "Client ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update":
      // TODO: Implement update
      return { success: true };
    case "delete":
      // TODO: Implement delete
      // return redirect("/crm");
      return { success: true };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ClientDetailRoute() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Client Detail
      </h1>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-gray-500 dark:text-gray-400">
          Detail view under development.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Handle 404 specifically
  if (error instanceof Response && error.status === 404) {
    return (
      <NotFoundError
        title="Client Not Found"
        message="The client you're looking for doesn't exist."
        backTo="/crm"
        backLabel="Back to CRM"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Client"
      message="We couldn't load this client. Please try again."
      backTo="/crm"
      backLabel="Back to CRM"
    />
  );
}
