/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Discovery Index Route
 *
 * Comprehensive e-discovery platform including legal holds, collections,
 * processing, review, productions, and privilege logging.
 *
 * @module routes/discovery/index
 */

import { DataService } from '@/services/data/data-service.service';
import { DiscoveryType } from '@/types/enums';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";
import { DiscoveryPlatform } from './components/platform/DiscoveryPlatform';

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
// Client Loader
// ============================================================================

/**
 * Fetches discovery processes on the client side only
 * Runs in the browser where localStorage auth tokens are available
 *
 * Note: Using clientLoader instead of loader because authentication tokens
 * are stored in localStorage which is not available during SSR
 */
export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const url = new URL(request.url);
  const caseId = url.searchParams.get("caseId") || undefined;

  try {
    const items = await DataService.evidence.getAll(caseId);
    return { items, totalCount: items.length };
  } catch (error) {
    console.error("Failed to load discovery data", error);
    return { items: [], totalCount: 0 };
  }
}

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

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
        const id = formData.get("id") as string;
        const response = formData.get("response") as string;

        if (id && response) {
          await DataService.discoveryRequests.update(id, {
            status: 'responded',
            responseDate: new Date().toISOString(),
            responseNotes: response
          });
        }
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
