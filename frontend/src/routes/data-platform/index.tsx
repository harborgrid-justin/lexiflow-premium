/**
 * Data Platform Index Route
 *
 * Centralized data management platform for data imports,
 * exports, integrations, and data quality monitoring.
 *
 * @module routes/data-platform/index
 */

import { AdminDatabaseControl } from '@/features/admin/components/data/AdminDatabaseControl';
import { DataService } from '@/services/data/dataService';
import { ActionFunctionArgs } from 'react-router-dom';
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
  try {
    // DataService.dataSources might be null if backend is disabled (though it shouldn't be in this context)
    const dataSources = await DataService.dataSources?.getAll() || [];
    return { items: dataSources, totalCount: dataSources.length };
  } catch (error) {
    console.error("Failed to load data sources", error);
    return { items: [], totalCount: 0 };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // TODO: Handle data source creation via DataService.dataSources.create()
      return { success: true, message: "Data source created" };
    case "delete":
      // TODO: Handle data source deletion via DataService.dataSources.delete()
      return { success: true, message: "Data source deleted" };
    case "sync":
      // TODO: Handle data sync via DataService.dataSources.sync()
      return { success: true, message: "Sync initiated" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DataPlatformIndexRoute() {
  return <AdminDatabaseControl />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
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
