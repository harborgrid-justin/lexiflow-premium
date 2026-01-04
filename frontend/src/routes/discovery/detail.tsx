/**
 * Discovery Detail Route
 *
 * Displays detailed information for a single discovery item.
 *
 * @module routes/discovery/detail
 */

import { DataService } from '@/services/data/dataService';
import type { DiscoveryRequest } from '@/types';
import { redirect, useLoaderData, useNavigate } from 'react-router';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createDetailMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/detail";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  const item = (data as { item: DiscoveryRequest } | undefined)?.item;
  return createDetailMeta({
    entityType: 'Discovery',
    entityName: item?.title,
    entityId: item?.id,
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function loader({ params }: Route.LoaderArgs) {
  const { discoveryId } = params;

  // CRITICAL: Validate param exists
  if (!discoveryId) {
    throw new Response("Discovery ID is required", { status: 400 });
  }

  try {
    const item = await DataService.discoveryRequests.getById(discoveryId);
    if (!item) {
      throw new Response("Discovery request not found", { status: 404 });
    }
    return { item };
  } catch (error) {
    console.error("Failed to load discovery request", error);
    throw new Response("Discovery request not found", { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: Route.ActionArgs) {
  const { discoveryId } = params;

  if (!discoveryId) {
    return { success: false, error: "Discovery ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "update": {
        const updates: Partial<DiscoveryRequest> = {};
        const title = formData.get("title");
        if (title && typeof title === 'string') updates.title = title;

        await DataService.discoveryRequests.update(discoveryId, updates);
        return { success: true };
      }
      case "delete": {
        await DataService.discoveryRequests.delete(discoveryId);
        return redirect("/discovery");
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

export default function DiscoveryDetailRoute() {
  const navigate = useNavigate();
  const { item } = useLoaderData() as { item: DiscoveryRequest };

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
        {item.title}
      </h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg dark:bg-gray-800">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Request Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {item.description || 'No description provided.'}
          </p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-gray-800/50">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Type
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-gray-100">
                {item.requestType}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-gray-800">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-gray-100">
                {item.status}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-gray-800/50">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Due Date
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-gray-100">
                {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </dl>
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
        title="Discovery Not Found"
        message="The discovery item you're looking for doesn't exist."
        backTo="/discovery"
        backLabel="Back to Discovery"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Discovery"
      message="We couldn't load this discovery item. Please try again."
      backTo="/discovery"
      backLabel="Back to Discovery"
    />
  );
}
