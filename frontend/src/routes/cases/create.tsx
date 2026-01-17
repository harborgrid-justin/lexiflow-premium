/**
 * Case Create Route
 *
 * Create a new legal case or matter with:
 * - Progressive enhancement via Form component
 * - Type-safe action handling
 * - Server-side and client-side validation
 * - Pre-fetched reference data (jurisdictions, templates)
 *
 * @module routes/cases/create
 */

import { redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';

import { catalogApi, jurisdictionApi } from '@/lib/frontend-api';
import NewCase from '@/routes/cases/components/create/NewCase';
import { DataService } from '@/services/data/data-service.service';
import { type CaseStatus } from '@/types';
import { requireAuthentication } from '@/utils/route-guards';

import { createMeta } from '../_shared/meta-utils';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';

// ============================================================================
// Types
// ============================================================================

type ActionData = Awaited<ReturnType<typeof action>>;

interface RouteComponentProps {
  actionData?: ActionData;
}

interface RouteErrorBoundaryProps {
  error: unknown;
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return createMeta({
    title: 'Create New Case',
    description: 'Create a new legal case or matter in LexiFlow',
  });
}

// ============================================================================
// Loader
// ============================================================================

/**
 * Pre-fetch reference data for case creation form
 */
export async function loader({ request }: LoaderFunctionArgs) {
  // Auth check
  requireAuthentication(request);

  // Pre-fetch reference data using new enterprise API
  const [jurisdictionsResult, templatesResult] = await Promise.all([
    jurisdictionApi.getAllJurisdictions({ page: 1, limit: 100 }),
    catalogApi.getAllTemplates({ page: 1, limit: 100 }),
  ]);

  const jurisdictions = jurisdictionsResult.ok ? jurisdictionsResult.data.data : [];
  const templates = templatesResult.ok ? templatesResult.data.data : [];

  return { jurisdictions, templates };
}

// ============================================================================
// Action
// ============================================================================

/**
 * Handle case creation form submission
 */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  try {
    const caseData = {
      title: formData.get("title") as string,
      caseNumber: formData.get("caseNumber") as string,
      jurisdiction: formData.get("jurisdictionId") as string,
      status: "Active" as CaseStatus,
      // ... extract all form fields
    };

    // Server-side validation
    if (!caseData.title || !caseData.caseNumber) {
      return {
        error: "Title and case number are required",
        values: caseData,
      };
    }

    // Create the case
    const newCase = await DataService.cases.add({
      ...caseData,
      jurisdiction: caseData.jurisdiction,
    });

    // Redirect on success
    return redirect(`/cases/${newCase.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to create case",
    };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function CreateCaseRoute({ actionData }: RouteComponentProps) {
  const error = actionData && 'error' in actionData ? (actionData.error) : null;

  return (
    <div className="container mx-auto p-6">
      <NewCase />

      {/* Show validation errors from action */}
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: RouteErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Case Creation Form"
      message="We couldn't load the case creation form. Please try again."
      backTo="/cases"
      backLabel="Back to Cases"
    />
  );
}
