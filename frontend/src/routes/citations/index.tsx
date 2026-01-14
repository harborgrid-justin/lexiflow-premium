/**
 * Citations Index Route
 *
 * Manage legal citations including citation checking,
 * formatting, and Bluebook compliance validation.
 *
 * @module routes/citations/index
 */

import { knowledgeApi } from '@/lib/frontend-api';
import { CitationManager } from '@/routes/citations/components/CitationManager';
import { DataService } from '@/services/data/data-service.service';
import type { ActionFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof clientLoader>> }) {
  return createListMeta({
    entityType: 'Citations',
    count: data?.items?.length,
    description: 'Legal citation management and Bluebook compliance',
  });
}

// ============================================================================
// Client Loader
// ============================================================================

/**
 * Fetches citations on the client side only
 * Note: Using clientLoader because auth tokens are in localStorage (not available during SSR)
 */
export async function clientLoader() {
  try {
    const result = await knowledgeApi.getAllCitations({ page: 1, limit: 100 });
    const items = result.ok ? result.data.data : [];
    return { items, totalCount: result.ok ? result.data.total : 0 };
  } catch (error) {
    console.error("Failed to load citations", error);
    return { items: [], totalCount: 0 };
  }
}

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const citation = formData.get("citation") as string;
      const court = formData.get("court") as string;
      const year = parseInt(formData.get("year") as string, 10);
      const title = formData.get("title") as string || undefined;
      const caseId = formData.get("caseId") as string || undefined;

      if (!citation || !court || !year) {
        return { success: false, error: "Citation text, court, and year are required" };
      }

      try {
        await DataService.citations.add({
          citation,
          court,
          year,
          title,
          caseId,
          status: "Valid",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        return { success: true, message: "Citation created successfully" };
      } catch (error) {
        console.error("Failed to create citation:", error);
        return { success: false, error: "Failed to create citation" };
      }
    }
    case "delete": {
      const id = formData.get("id") as string;
      if (id) {
        await DataService.citations.delete(id);
        return { success: true, message: "Citation deleted" };
      }
      return { success: false, error: "Missing citation ID" };
    }
    case "validate": {
      const id = formData.get("id") as string;
      const citation = formData.get("citation") as string;

      if (!citation) {
        return { success: false, error: "Citation text required for validation" };
      }

      try {
        const bluebookPattern = /^(\d+)\s+([A-Z][a-z]+\.?)\s+(\d+)(,\s+(\d+))?\s+\((\d{4})\)$/;
        const isValidFormat = bluebookPattern.test(citation);

        if (id && isValidFormat) {
          await DataService.citations.update(id, {
            status: "Valid",
            updatedAt: new Date().toISOString()
          });
        }

        return {
          success: true,
          message: isValidFormat ? "Citation is Bluebook compliant" : "Citation format needs review",
          isValid: isValidFormat
        };
      } catch (error) {
        console.error("Failed to validate citation:", error);
        return { success: false, error: "Validation failed" };
      }
    }
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
