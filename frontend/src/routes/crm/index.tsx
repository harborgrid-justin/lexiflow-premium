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

import { Link } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

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

export async function loader({ request }: Route.LoaderArgs) {
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

export default function CRMIndexRoute({ loaderData }: Route.ComponentProps) {
  const { clients, totalCount } = loaderData;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Client CRM
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage client relationships and contact information
          </p>
        </div>

        <Link
          to="/crm/add"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add Client
        </Link>
      </div>

      {/* Placeholder Content */}
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          CRM Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Client management features coming soon.
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {totalCount} clients in system
        </p>
      </div>
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
      title="Failed to Load CRM"
      message="We couldn't load the client data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
