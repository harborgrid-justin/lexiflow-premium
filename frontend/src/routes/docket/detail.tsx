/**
 * Docket Detail Route
 *
 * Displays detailed information for a single docket entry.
 *
 * @module routes/docket/detail
 */

import { DataService } from '@/services/data/dataService';
import type { CaseId } from '@/types/primitives';
import { format } from 'date-fns';
import { useLoaderData, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { createDetailMeta } from '../_shared/meta-utils';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof clientLoader>> }) {
  return createDetailMeta({
    entityType: 'Docket',
    entityName: data?.item?.title || data?.item?.description,
    entityId: data?.item?.id,
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { docketId } = params;

  // CRITICAL: Validate param exists
  if (!docketId) {
    throw new Response("Docket ID is required", { status: 400 });
  }

  // Ignore internal router requests or static assets that might be matched
  if (docketId === 'file' || docketId.endsWith('.data')) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    const item = await DataService.docket.getById(docketId as CaseId);
    if (!item) {
      throw new Response("Docket entry not found", { status: 404 });
    }
    return { item };
  } catch (error: any) {
    if (error?.statusCode === 404) {
      throw new Response("Docket entry not found", { status: 404 });
    }
    console.error("Failed to load docket entry:", error);
    throw error;
  }
}

// Force client-side execution for hydration (needed for localStorage auth)
clientLoader.hydrate = true as const;

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: ActionFunctionArgs) {
  const { docketId } = params;

  if (!docketId) {
    return { success: false, error: "Docket ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "update": {
      const entryNumber = formData.get("entryNumber") as string;
      const description = formData.get("description") as string;
      const filingDate = formData.get("filingDate") as string;

      const updates: Partial<{
        updatedAt: string;
        docketNumber: string;
        description: string;
        dateFiled: string;
      }> = {
        updatedAt: new Date().toISOString(),
      };

      if (entryNumber) updates.docketNumber = entryNumber;
      if (description) updates.description = description;
      if (filingDate) updates.dateFiled = filingDate;

      await DataService.docket.update(docketId, updates);
      return { success: true, message: "Docket entry updated successfully" };
    }
    case "delete": {
      await DataService.docket.delete(docketId);
      return {
        success: true,
        message: "Docket entry deleted successfully",
        redirect: "/docket"
      };
    }
    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function DocketDetailRoute() {
  const { item } = useLoaderData() as Awaited<ReturnType<typeof clientLoader>>;
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

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {item.title || item.description}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Filed: {item.dateFiled ? format(new Date(item.dateFiled), 'PPP') : 'N/A'}</span>
            <span>•</span>
            <span>Type: {item.type}</span>
            {item.docketNumber && (
              <>
                <span>•</span>
                <span>Docket #: {item.docketNumber}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {item.documentUrl && (
            <a
              href={item.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View Document
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Metadata</h3>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Filed By</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.filedBy || 'Unknown'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Sequence Number</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{item.sequenceNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.isSealed ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                    {item.isSealed ? 'Sealed' : 'Public'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-6">
          {/* Related Actions */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500">
                Add Note
              </button>
              <button className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:ring-gray-600 dark:hover:bg-gray-600">
                Set Reminder
              </button>
            </div>
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
        title="Docket Not Found"
        message="The docket you're looking for doesn't exist."
        backTo="/docket"
        backLabel="Back to Docket"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Docket"
      message="We couldn't load this docket. Please try again."
      backTo="/docket"
      backLabel="Back to Docket"
    />
  );
}
