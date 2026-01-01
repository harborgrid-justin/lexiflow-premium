/**
 * Data Platform Index Route
 *
 * Centralized data management platform for data imports,
 * exports, integrations, and data quality monitoring.
 *
 * @module routes/data-platform/index
 */

import { Link, useNavigate } from 'react-router';
import type { Route } from "./+types/index";
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Data Sources',
    count: data?.items?.length,
    description: 'Manage data integrations and data quality',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: Route.LoaderArgs) {
  // TODO: Implement data platform fetching
  // const dataSources = await api.dataPlatform.getSources();
  // const integrations = await api.dataPlatform.getIntegrations();

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
      // TODO: Handle data source creation
      return { success: true, message: "Data source created" };
    case "delete":
      // TODO: Handle data source deletion
      return { success: true, message: "Data source deleted" };
    case "sync":
      // TODO: Handle data sync
      return { success: true, message: "Sync initiated" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DataPlatformIndexRoute({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Data Platform
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage data integrations, imports, and data quality
          </p>
        </div>

        <Link
          to="/data-platform/connect"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Connect Source
        </Link>
      </div>

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
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          Data Platform Module
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          This module is under development. Data integration features coming soon.
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
      title="Failed to Load Data Platform"
      message="We couldn't load the data platform. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
