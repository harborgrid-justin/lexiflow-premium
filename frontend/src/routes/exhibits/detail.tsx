/**
 * Exhibit Detail Route
 *
 * Displays detailed information for a single exhibit.
 *
 * @module routes/exhibits/detail
 */

import { DataService } from '@/services/data/dataService';
import type { TrialExhibit } from '@/types';
import { useLoaderData, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createDetailMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: { item: TrialExhibit } }) {
  return createDetailMeta({
    entityType: 'Exhibit',
    entityName: data?.item?.title ?? 'Unknown Exhibit',
    entityId: data?.item?.id ?? 'unknown',
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function loader({ params }: LoaderFunctionArgs) {
  const { exhibitId } = params;

  // CRITICAL: Validate param exists
  if (!exhibitId) {
    throw new Response("Exhibit ID is required", { status: 400 });
  }

  try {
    const item = await DataService.exhibits.getById(exhibitId);
    if (!item) {
      throw new Response("Exhibit not found", { status: 404 });
    }
    return { item };
  } catch (error) {
    console.error("Failed to load exhibit", error);
    if (error instanceof Response) throw error;
    throw new Response("Exhibit not found", { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: ActionFunctionArgs) {
  const { exhibitId } = params;

  if (!exhibitId) {
    return { success: false, error: "Exhibit ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "update": {
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const exhibitNumber = formData.get("exhibitNumber") as string;
        const status = formData.get("status") as string;

        const updates: Partial<TrialExhibit> = {
          updatedAt: new Date().toISOString(),
        };

        if (title) updates.title = title;
        if (description) updates.description = description;
        if (exhibitNumber) updates.exhibitNumber = exhibitNumber;
        if (status) updates.status = status as any;

        await DataService.exhibits.update(exhibitId, updates);
        return { success: true, message: "Exhibit updated successfully" };
      }
      case "delete": {
        await DataService.exhibits.delete(exhibitId);
        return {
          success: true,
          message: "Exhibit deleted successfully",
          redirect: "/exhibits"
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

export default function ExhibitDetailRoute() {
  const navigate = useNavigate();
  const { item } = useLoaderData() as { item: TrialExhibit };

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
        Exhibit {item.exhibitNumber ? `#${item.exhibitNumber}` : ''}: {item.title}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">{item.status}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</h3>
            <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">{item.type}</p>
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

export function ErrorBoundary({ error }: { error: unknown }) {
  // Handle 404 specifically
  if (error instanceof Response && error.status === 404) {
    return (
      <NotFoundError
        title="Exhibit Not Found"
        message="The exhibit you're looking for doesn't exist."
        backTo="/exhibits"
        backLabel="Back to Exhibits"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Exhibit"
      message="We couldn't load this exhibit. Please try again."
      backTo="/exhibits"
      backLabel="Back to Exhibits"
    />
  );
}
