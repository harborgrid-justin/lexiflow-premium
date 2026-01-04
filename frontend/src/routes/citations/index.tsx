/**
 * Citations Index Route
 *
 * Manage legal citations including citation checking,
 * formatting, and Bluebook compliance validation.
 *
 * @module routes/citations/index
 */

import type { ActionFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createListMeta({
    entityType: 'Citations',
    count: data?.items?.length,
    description: 'Legal citation management and Bluebook compliance',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader() {
  // TODO: Implement citation fetching
  // const url = new URL(request.url);
  // const caseId = url.searchParams.get("caseId");
  // const citations = await api.citations.list({ caseId });

  return { items: [], totalCount: 0 };
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create":
      // TODO: Handle citation creation
      return { success: true, message: "Citation created" };
    case "delete":
      // TODO: Handle citation deletion
      return { success: true, message: "Citation deleted" };
    case "validate":
      // TODO: Handle citation validation
      return { success: true, message: "Citation validated" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

import { CitationManager } from '@/features/knowledge/citation/CitationManager';

export default function CitationsIndexRoute() {
  return <CitationManager />;
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Citations"
      message="We couldn't load the citation data. Please try again."
      backTo="/"
      backLabel="Return to Dashboard"
    />
  );
}
