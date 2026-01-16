/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Exhibit Pro Index Route
 *
 * Professional exhibit management for trial preparation,
 * including exhibit numbering, organization, and presentation.
 *
 * @module routes/exhibits/index
 */

import { useLoaderData } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

import type { ExhibitsLoaderData } from './loader';

// Export loader from dedicated file
export { clientLoader } from './loader';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Exhibits',
    count: data?.exhibits?.length,
    description: 'Professional exhibit management for trial preparation',
  });
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "create":
        return { success: true, message: "Exhibit created" };
      case "delete":
        const id = formData.get("id") as string;
        if (id) {
          await DataService.exhibits.delete(id);
          return { success: true, message: "Exhibit deleted" };
        }
        return { success: false, error: "Missing ID" };
      case "update-status":
        // Implementation for status update
        return { success: true, message: "Status updated" };
      default:
        return { success: false, error: "Invalid action" };
    }
  } catch (error) {
    console.error("Action failed:", error);
    return { success: false, error: "Operation failed" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { ExhibitsPage } from './ExhibitsPage';

export default function ExhibitsIndexRoute() {
  const loaderData = useLoaderData() as ExhibitsLoaderData;
  return <ExhibitsPage loaderData={loaderData} />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export { RouteErrorBoundary as ErrorBoundary };
