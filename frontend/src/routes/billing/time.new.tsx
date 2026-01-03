/**
 * New Time Entry Route
 * Form to create a new time entry with timer
 */

import { TimeEntriesApiService } from '@/api/billing';
import { TimeEntryForm } from '@/components/billing/TimeEntryForm';
import { useNavigate } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import type { Route } from "./+types/time.new";

// ============================================================================
// Meta Tags
// ============================================================================

export function meta() {
  return [
    { title: 'New Time Entry | LexiFlow' },
    { name: 'description', content: 'Create a new time entry' },
  ];
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const timeApi = new TimeEntriesApiService();

  try {
    const entry = {
      caseId: formData.get("caseId") as string,
      userId: formData.get("userId") as string,
      date: formData.get("date") as string,
      hours: parseFloat(formData.get("hours") as string),
      rate: parseFloat(formData.get("rate") as string),
      description: formData.get("description") as string,
      billable: formData.get("billable") === "true",
      status: (formData.get("status") as string) || 'Draft',
      taskCode: formData.get("taskCode") as string || undefined,
      activityType: formData.get("activityType") as string || undefined,
    };

    const created = await timeApi.create(entry);

    return {
      success: true,
      message: "Time entry created successfully",
      entryId: created.id,
      redirect: '/billing/time'
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create time entry";
    return {
      success: false,
      error: errorMessage
    };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function NewTimeEntryRoute({ actionData }: Route.ComponentProps) {
  const navigate = useNavigate();

  // Redirect after successful creation
  if (actionData?.success && actionData?.redirect) {
    setTimeout(() => navigate(actionData.redirect), 1500);
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          New Time Entry
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Record billable time with optional timer
        </p>
      </div>

      {/* Action Result */}
      {actionData?.message && (
        <div className={`mb-4 rounded-md p-4 ${actionData.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {actionData.message}
        </div>
      )}

      {/* Time Entry Form */}
      <TimeEntryForm
        onCancel={() => navigate('/billing/time')}
        actionError={actionData?.error}
      />
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Create Time Entry"
      message="We couldn't create the time entry. Please try again."
      backTo="/billing/time"
      backLabel="Return to Time Entries"
    />
  );
}
