/**
 * Time Entries Route
 * Displays time entries list with filtering and search
 */

import { TimeEntriesApiService } from '@/lib/frontend-api';
import { Link, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';
import { TimeEntryList } from './components/TimeEntryList';

interface ActionData {
  success: boolean;
  error?: string;
  message?: string;
}

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createListMeta({
    entityType: 'Time Entries',
    count: data?.entries?.length,
    description: 'Track and manage billable time entries',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const caseId = url.searchParams.get('caseId');
  console.log('case ID:', caseId);
  const userId = url.searchParams.get('userId');
  const status = url.searchParams.get('status');
  const billable = url.searchParams.get('billable');

  const timeApi = new TimeEntriesApiService();

  try {
    const entries = await timeApi.getAll({
      caseId: caseId || undefined,
      userId: userId || undefined,
      status: (status as 'Draft' | 'Submitted' | 'Approved' | 'Billed') || undefined,
      billable: billable === 'true' ? true : billable === 'false' ? false : undefined,
    });

    return {
      entries,
      filters: { caseId, userId, status, billable },
    };
  } catch (error) {
    console.error('Failed to load time entries:', error);
    return {
      entries: [],
      filters: { caseId, userId, status, billable },
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const timeApi = new TimeEntriesApiService();

  switch (intent) {
    case "approve": {
      const approveId = formData.get("id") as string;
      try {
        await timeApi.approve(approveId);
        return { success: true, message: "Time entry approved" };
      } catch {
        return { success: false, error: "Failed to approve entry" };
      }
    }

    case "approve-bulk": {
      const approveIds = JSON.parse(formData.get("ids") as string);
      try {
        const result = await timeApi.approveBulk(approveIds);
        return { success: true, message: `${result.success} entries approved`, result };
      } catch {
        return { success: false, error: "Failed to approve entries" };
      }
    }

    case "delete": {
      const deleteId = formData.get("id") as string;
      try {
        await timeApi.delete(deleteId);
        return { success: true, message: "Time entry deleted" };
      } catch {
        return { success: false, error: "Failed to delete entry" };
      }
    }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

interface ActionData {
  success: boolean;
  error?: string;
}

export default function TimeEntriesRoute({ actionData }: { actionData: ActionData }) {
  const { entries, filters } = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Time Entries
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Track billable and non-billable time
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to="/billing/time/new"
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Time Entry
          </Link>
        </div>
      </div>

      {/* Action Result */}
      {actionData?.message && (
        <div className={`mb-4 rounded-md p-4 ${actionData.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {actionData.message}
        </div>
      )}

      {/* Time Entry List */}
      <TimeEntryList
        entries={entries}
        filters={filters}
      />
    </div>
  );
}

// ============================================================================
// Error Boundary
// ============================================================================

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <RouteErrorBoundary
      error={error}
      title="Failed to Load Time Entries"
      message="We couldn't load the time entries. Please try again."
      backTo="/billing"
      backLabel="Return to Billing"
    />
  );
}
