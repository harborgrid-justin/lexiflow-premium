/**
 * Data Platform Index Route
 *
 * Centralized data management platform for data imports,
 * exports, integrations, and data quality monitoring.
 *
 * @module routes/data-platform/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createListMeta({
    entityType: 'Data Sources',
    count: data?.items?.length,
    description: 'Manage data integrations and data quality',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
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

import { AdminDatabaseControl } from '@/features/admin/components/data/AdminDatabaseControl';

export default function DataPlatformIndexRoute() {
  return <AdminDatabaseControl />;
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
