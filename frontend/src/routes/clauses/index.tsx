/**
 * Clause Library Index Route
 *
 * Manage reusable contract clauses, boilerplate language,
 * and clause templates for document assembly.
 *
 * @module routes/clauses/index
 */

import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Clauses',
    count: data?.items?.length,
    description: 'Manage contract clauses and boilerplate language',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement clause library fetching
  // const url = new URL(request.url);
  // const category = url.searchParams.get("category");
  // const clauses = await api.clauses.list({ category });

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
      // TODO: Handle clause creation
      return { success: true, message: "Clause created" };
    case "delete":
      // TODO: Handle clause deletion
      return { success: true, message: "Clause deleted" };
    case "duplicate":
      // TODO: Handle clause duplication
      return { success: true, message: "Clause duplicated" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import ClauseLibrary from '@/features/knowledge/clauses/ClauseLibrary';

export default function ClausesIndexRoute() {
  return <ClauseLibrary />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Clause Library"
      message="We couldn't load the clause library. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
