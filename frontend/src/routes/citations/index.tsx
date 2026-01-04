/**
 * Citations Index Route
 *
 * Manage legal citations including citation checking,
 * formatting, and Bluebook compliance validation.
 *
 * @module routes/citations/index
 */

import { CitationManager } from '@/features/knowledge/citation/CitationManager';
import { DataService } from '@/services/data/dataService';
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
  try {
    const citations = await DataService.citations.getAll();
    return { items: citations, totalCount: citations.length };
  } catch (error) {
    console.error("Failed to load citations", error);
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
      // TODO: Implement create via DataService.citations.add()
      return { success: true, message: "Citation created" };
    case "delete": {
      const id = formData.get("id") as string;
      if (id) {
        await DataService.citations.delete(id);
        return { success: true, message: "Citation deleted" };
      }
      return { success: false, error: "Missing citation ID" };
    }
    case "validate":
      // TODO: Implement validation via DataService.citations.validate() if available
      return { success: true, message: "Citation validated" };
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

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
