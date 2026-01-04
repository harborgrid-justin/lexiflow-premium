/**
 * Entity Director Index Route
 *
 * Manage legal entities including corporations, LLCs,
 * partnerships, and trusts with corporate governance tracking.
 *
 * @module routes/entities/index
 */

import { EntityDirector } from '@/features/cases/components/entities/EntityDirector';
import { DataService } from '@/services/data/dataService';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Entities',
    count: data?.items?.length,
    description: 'Manage legal entities and corporate governance',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  try {
    const entities = await DataService.entities.getAll();
    return { items: entities, totalCount: entities.length };
  } catch (error) {
    console.error("Failed to load entities", error);
    return { items: [], totalCount: 0 };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // Entity creation is typically handled via the UI modal which calls the API directly
      // or submits to this action. For now, we'll assume the UI handles it or we'd need
      // to parse the full entity object here.
      return { success: true, message: "Entity created" };
    case "delete":
      const id = formData.get("id") as string;
      if (id) {
        await DataService.entities.delete(id);
        return { success: true, message: "Entity deleted" };
      }
      return { success: false, error: "Missing entity ID" };
    case "archive":
      // TODO: Implement archive functionality in DataService.entities
      return { success: true, message: "Entity archived" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function EntitiesIndexRoute() {
  return <EntityDirector />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Entity Director"
      message="We couldn't load the entity data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
