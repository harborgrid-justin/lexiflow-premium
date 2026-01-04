/**
 * Entity Director Index Route
 *
 * Manage legal entities including corporations, LLCs,
 * partnerships, and trusts with corporate governance tracking.
 *
 * @module routes/entities/index
 */

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
  // TODO: Implement entity data fetching
  // const url = new URL(request.url);
  // const type = url.searchParams.get("type");
  // const entities = await api.entities.list({ type });

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
      // TODO: Handle entity creation
      return { success: true, message: "Entity created" };
    case "delete":
      // TODO: Handle entity deletion
      return { success: true, message: "Entity deleted" };
    case "archive":
      // TODO: Handle entity archival
      return { success: true, message: "Entity archived" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { EntityDirector } from '@/features/cases/components/entities/EntityDirector';

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
