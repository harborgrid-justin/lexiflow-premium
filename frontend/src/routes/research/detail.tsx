/**
 * Research Detail Route
 *
 * Displays detailed information for a single research item.
 *
 * @module routes/research/detail
 */

import { knowledgeApi } from '@/lib/frontend-api';
import { DataService } from '@/services/data/data-service.service';
import type { ResearchSession } from '@/types';
import { useNavigate } from 'react-router';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createDetailMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/detail";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createDetailMeta({
    entityType: 'Research',
    entityName: (data as { item: ResearchSession } | undefined)?.item?.query, // Assuming query is the title/name
    entityId: (data as { item: ResearchSession } | undefined)?.item?.id,
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function loader({ params }: Route.LoaderArgs) {
  const { researchId } = params;

  if (!researchId) {
    throw new Response("Research ID is required", { status: 400 });
  }

  try {
    // Fetch research using new enterprise API
    const result = await knowledgeApi.getResearchById(researchId);
    if (!result.ok) {
      throw new Response("Research session not found", { status: 404 });
    }
    return { item: result.data };
  } catch (error) {
    console.error("Failed to load research session:", error);
    if (error instanceof Response) throw error;
    throw new Response("Research session not found", { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: Route.ActionArgs) {
  const { researchId } = params;

  if (!researchId) {
    return { success: false, error: "Research ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update": {
      const query = formData.get("query") as string;
      const notes = formData.get("notes") as string;
      const status = formData.get("status") as string;

      const updates: Partial<ResearchSession> = {
        updatedAt: new Date().toISOString(),
      };

      if (query) updates.query = query;
      if (notes) {
        // Store notes in metadata or a dedicated field
        (updates as Partial<ResearchSession> & { notes?: string }).notes = notes;
      }
      if (status) {
        // Store status in metadata or a dedicated field
        (updates as Partial<ResearchSession> & { status?: string }).status = status;
      }

      await DataService.knowledge.research.update(researchId, updates);
      return { success: true, message: "Research session updated successfully" };
    }
    case "delete": {
      await DataService.knowledge.research.delete(researchId);
      return {
        success: true,
        message: "Research session deleted successfully",
        redirect: "/research"
      };
    }
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ResearchDetailRoute() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Research Detail
      </h1>

      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-700 dark:bg-gray-800/50">
        <p className="text-gray-500 dark:text-gray-400">
          Detail view under development.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // Handle 404 specifically
  if (error instanceof Response && error.status === 404) {
    return (
      <NotFoundError
        title="Research Not Found"
        message="The research item you're looking for doesn't exist."
        backTo="/research"
        backLabel="Back to Research"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Research"
      message="We couldn't load this research item. Please try again."
      backTo="/research"
      backLabel="Back to Research"
    />
  );
}
