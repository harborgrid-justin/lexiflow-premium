/**
 * Discovery Index Route
 *
 * Comprehensive e-discovery platform including legal holds, collections,
 * processing, review, productions, and privilege logging.
 *
 * @module routes/discovery/index
 */

import { DiscoveryPlatform } from '@/features/litigation/discovery/DiscoveryPlatform';
import { DataService } from '@/services/data/dataService';
import { DiscoveryType } from '@/types/enums';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

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

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const caseId = url.searchParams.get("caseId") || undefined;

  try {
    // Fetch discovery processes
    const items = await DataService.discoveryMain.getAll({ caseId });
    return { items, totalCount: items.length };
  } catch (error) {
    console.error("Failed to load discovery data", error);
    return { items: [], totalCount: 0 };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create": {
        const title = formData.get("title") as string;
        const caseId = formData.get("caseId") as string;
        const type = formData.get("type") as DiscoveryType;

        if (title && caseId && type) {
          await DataService.discoveryRequests.create({
            title,
            caseId,
            requestType: type,
            status: 'draft'
          });
        }
        return { success: true, message: "Discovery request created" };
      }

      case "delete": {
        const id = formData.get("id") as string;
        if (id) await DataService.discoveryRequests.delete(id);
        return { success: true, message: "Discovery request deleted" };
      }

      case "respond": {
        // TODO: Handle discovery response (update request)
        return { success: true, message: "Response recorded" };
      }

      default:
        return { success: false, error: "Invalid action" };
    }
  } catch {
    return { success: false, error: "Action failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DiscoveryIndexRoute() {
  return <DiscoveryPlatform initialTab="dashboard" />;
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
