/**
 * Evidence Detail Route
 *
 * Displays detailed information for a single evidence item.
 *
 * @module routes/evidence/detail
 */

import { DataService } from '@/services/data/dataService';
import type { EvidenceItem } from '@/types';
import { useLoaderData, useNavigate } from 'react-router';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createDetailMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/detail";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  return createDetailMeta({
    entityType: 'Evidence',
    entityName: data?.item?.title ?? 'Unknown Evidence',
    entityId: data?.item?.id ?? 'unknown',
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function loader({ params }: Route.LoaderArgs) {
  const { evidenceId } = params;

  // CRITICAL: Validate param exists
  if (!evidenceId) {
    throw new Response("Evidence ID is required", { status: 400 });
  }

  try {
    const item = await DataService.evidence.getById(evidenceId);
    if (!item) {
      throw new Response("Evidence not found", { status: 404 });
    }
    return { item };
  } catch (error) {
    console.error("Failed to load evidence", error);
    if (error instanceof Response) throw error;
    throw new Response("Evidence not found", { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: Route.ActionArgs) {
  const { evidenceId } = params;

  if (!evidenceId) {
    return { success: false, error: "Evidence ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "update": {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const status = formData.get("status") as string;
        const location = formData.get("location") as string;

        const updates: Partial<EvidenceItem> = {
          updatedAt: new Date().toISOString(),
        };

        if (title) updates.title = title;
        if (description) updates.description = description;
        if (status) updates.status = status;
        if (location) updates.location = location;

        await DataService.evidence.update(evidenceId, updates);
        return { success: true, message: "Evidence updated successfully" };
      }
      case "delete": {
        await DataService.evidence.delete(evidenceId);
        return {
          success: true,
          message: "Evidence deleted successfully",
          redirect: "/evidence"
        };
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

export default function EvidenceDetailRoute() {
  const navigate = useNavigate();
  const { item } = useLoaderData() as { item: EvidenceItem };

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
        Evidence: {item.title}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">{item.type}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">{item.status}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Custodian</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{item.custodian}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{item.location}</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
              {item.description || <span className="text-gray-400 italic">No description provided</span>}
            </p>
          </div>
        </div>
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
        title="Evidence Not Found"
        message="The evidence you're looking for doesn't exist."
        backTo="/evidence"
        backLabel="Back to Evidence"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Evidence"
      message="We couldn't load this evidence. Please try again."
      backTo="/evidence"
      backLabel="Back to Evidence"
    />
  );
}
