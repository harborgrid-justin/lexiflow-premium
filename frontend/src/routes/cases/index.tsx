/**
 * Cases Index Route (List View)
 *
 * The main case management page displaying all cases with:
 * - Server-side data loading via loader
 * - Progressive enhancement with Form for actions
 * - Type-safe params and data via Route types
 * - Dynamic meta tags based on case count
 * - Error boundary with recovery options
 *
 * React Router v7 Best Practices:
 * - Uses loader for data fetching (NOT useEffect)
 * - Uses action for mutations (create/delete)
 * - Uses useNavigate for programmatic navigation from callbacks
 * - Uses Link component in error boundary
 * - Type-safe loaderData and actionData
 *
 * @module routes/cases/index
 */

import { CaseManagement } from '@/features/cases/components/list/CaseManagement';
import { DataService } from '@/services/data/dataService';
import type { Case } from '@/types';
import { useCallback } from 'react';
import { redirect, useNavigate } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

// ============================================================================
// Meta Tags
// ============================================================================

/**
 * Dynamic meta tags showing case count
 */
export function meta({ data }: Route.MetaArgs) {
  const caseCount = data?.cases?.length;
  return createListMeta({
    entityType: 'Cases',
    count: caseCount,
    description: 'Manage your legal cases and matters',
  });
}

// ============================================================================
// Loader - Client-side Data Fetching
// ============================================================================

/**
 * Fetches all cases and related data in parallel
 * Runs on the client to access localStorage auth token
 */
export async function clientLoader() {
  // TODO: Auth check
  // const user = await requireAuth(request);

  // Fetch data in parallel for performance
  const [cases, invoices] = await Promise.all([
    DataService.cases.getAll(),
    DataService.invoices.getAll(),
  ]);

  return { cases, invoices };
}

// Ensure client loader runs on hydration
clientLoader.hydrate = true as const;

// ============================================================================
// Action - Form Submissions
// ============================================================================

/**
 * Handles form submissions for case CRUD operations
 * Supports progressive enhancement - works without JavaScript
 */
export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  switch (intent) {
    case "create": {
      const title = formData.get("title") as string;
      const caseNumber = formData.get("caseNumber") as string;

      // Validation
      if (!title?.trim()) {
        return { success: false, error: "Title is required", fieldErrors: { title: "Required" } };
      }
      if (!caseNumber?.trim()) {
        return { success: false, error: "Case number is required", fieldErrors: { caseNumber: "Required" } };
      }

      try {
        const newCase = await DataService.cases.add({
          title: title.trim(),
          caseNumber: caseNumber.trim(),
          status: "Active",
        } as Case);

        // Redirect to the new case on success
        return redirect(`/cases/${newCase.id}`);
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to create case",
        };
      }
    }

    case "delete": {
      const caseId = formData.get("caseId") as string;

      if (!caseId) {
        return { success: false, error: "Case ID is required" };
      }

      try {
        await DataService.cases.delete(caseId);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to delete case",
        };
      }
    }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function CasesRoute({ loaderData, actionData }: Route.ComponentProps) {
  const { cases, invoices } = loaderData;
  const navigate = useNavigate();

  // Memoized handler for case selection
  const handleSelectCase = useCallback((id: string) => {
    navigate(`/cases/${id}`);
  }, [navigate]);

  return (
    <div className="min-h-full">
      {/* Main Case Management Component */}
      <CaseManagement
        initialCases={cases}
        initialInvoices={invoices}
        onSelectCase={handleSelectCase}
      />

      {/* Action Error Display */}
      {actionData && !actionData.success && actionData.error && (
        <div
          className="fixed bottom-4 right-4 max-w-sm rounded-md border border-red-200 bg-red-50 p-4 shadow-lg dark:border-red-800 dark:bg-red-900/90"
          role="alert"
        >
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Action Failed
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {actionData.error}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

/**
 * Route-specific error boundary with recovery options
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  console.error("Cases route error:", error);

  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Cases"
      message="We couldn't load your cases. This might be a temporary issue."
      backTo="/"
      backLabel="Return to Dashboard"
      onRetry={() => window.location.reload()}
    />
  );
}
