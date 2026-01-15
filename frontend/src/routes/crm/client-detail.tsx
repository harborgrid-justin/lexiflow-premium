/**
 * Client Detail Route
 *
 * Displays detailed information for a single client.
 *
 * @module routes/crm/client-detail
 */

import { useTheme } from '@/contexts/ThemeContext';
import { DataService } from '@/services/data/data-service.service';
import type { Client } from '@/types';
import { redirect, useLoaderData, useNavigate } from 'react-router';
import { NotFoundError, RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createDetailMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/client-detail";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: Route.MetaArgs) {
  const item = (data as { item: Client } | undefined)?.item;
  return createDetailMeta({
    entityType: 'Client',
    entityName: item?.name ?? 'Unknown Client',
    entityId: item?.id ?? 'unknown',
  });
}

// ============================================================================
// Loader - WITH PROPER PARAM VALIDATION
// ============================================================================

export async function loader({ params }: Route.LoaderArgs) {
  const { clientId } = params;

  // CRITICAL: Validate param exists
  if (!clientId) {
    throw new Response("Client ID is required", { status: 400 });
  }

  try {
    const item = await DataService.clients.getById(clientId);
    if (!item) {
      throw new Response("Client not found", { status: 404 });
    }
    return { item };
  } catch (error) {
    console.error("Failed to load client", error);
    throw new Response("Client not found", { status: 404 });
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ params, request }: Route.ActionArgs) {
  const { clientId } = params;

  if (!clientId) {
    return { success: false, error: "Client ID is required" };
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    switch (intent) {
      case "update": {
        const updates: Partial<Client> = {};
        const name = formData.get("name");
        if (name && typeof name === 'string') updates.name = name;

        await DataService.clients.update(clientId, updates);
        return { success: true };
      }
      case "delete": {
        await DataService.clients.delete(clientId);
        return redirect("/crm");
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

export default function ClientDetailRoute() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { item } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <div className="p-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className={`inline-flex items-center gap-2 text-sm ${theme.text.secondary} ${theme.interactive.hover}`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-2xl font-bold ${theme.text.primary}`}>
          {item.name}
        </h1>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {item.status}
        </span>
      </div>

      <div className={`${theme.surface.default} shadow overflow-hidden sm:rounded-lg`}>
        <div className="px-4 py-5 sm:px-6">
          <h3 className={`text-lg leading-6 font-medium ${theme.text.primary}`}>
            Client Information
          </h3>
          <p className={`mt-1 max-w-2xl text-sm ${theme.text.secondary}`}>
            Personal details and contact information.
          </p>
        </div>
        <div className={`border-t ${theme.border.default}`}>
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-gray-800/50">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Full name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-gray-100">
                {item.name}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-gray-800">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Industry
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-gray-100">
                {item.industry || 'N/A'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-gray-800/50">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Email address
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-gray-100">
                {item.email || 'N/A'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 dark:bg-gray-800">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Billed
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 dark:text-gray-100">
                ${item.totalBilled?.toLocaleString() || '0'}
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
        title="Client Not Found"
        message="The client you're looking for doesn't exist."
        backTo="/crm"
        backLabel="Back to CRM"
      />
    );
  }

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Client"
      message="We couldn't load this client. Please try again."
      backTo="/crm"
      backLabel="Back to CRM"
    />
  );
}
