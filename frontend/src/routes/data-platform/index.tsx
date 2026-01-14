/**
 * Data Platform Index Route
 *
 * Centralized data management platform for data imports,
 * exports, integrations, and data quality monitoring.
 *
 * @module routes/data-platform/index
 */

import { AdminDatabaseControl } from '@/routes/admin/components/data/AdminDatabaseControl';
import { DataSourceService } from '@/services/domain/DataSourceDomain';
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
    const dataSources = await DataSourceService.getAll() || [];
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

  try {
    switch (intent) {
      case "create": {
        const name = formData.get("name") as string;
        const type = formData.get("type") as string;
        const host = formData.get("host") as string;
        const port = formData.get("port") ? parseInt(formData.get("port") as string) : undefined;
        const database = formData.get("database") as string;

        if (!name || !type) {
          return { success: false, error: "Name and type are required" };
        }

        await DataSourceService.add({
          name,
          type,
          host,
          port,
          database,
          connected: false,
        });
        return { success: true, message: "Data source created" };
      }
      case "delete": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "ID is required" };
        await DataSourceService.delete(id);
        return { success: true, message: "Data source deleted" };
      }
      case "sync": {
        const id = formData.get("id") as string;
        if (!id) return { success: false, error: "ID is required" };
        await DataSourceService.sync(id);
        return { success: true, message: "Sync initiated" };
      }
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Action failed", error);
    return { success: false, error: "Action failed" };
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
