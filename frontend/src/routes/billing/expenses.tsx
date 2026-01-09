/**
 * Expenses Route
 * Displays expense tracking list with filtering
 */

import { ExpensesApiService } from '@/api/billing';
import { ExpenseList } from '@/features/operations/billing/components/time-tracking/ExpenseList';
import { Link, useActionData, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createListMeta({
    entityType: 'Expenses',
    count: data?.expenses?.length,
    description: 'Track and manage firm expenses',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const caseId = url.searchParams.get('caseId');
  console.log('case ID:', caseId);
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status');

  const expensesApi = new ExpensesApiService();

  try {
    const expenses = await expensesApi.getAll({
      caseId: caseId || undefined,
      category: category || undefined,
      status: (status as "Draft" | "Approved" | "Rejected" | "Billed" | "Submitted") || undefined,
    });

    return {
      expenses,
      filters: { caseId, category, status },
    };
  } catch (error) {
    console.error('Failed to load expenses:', error);
    return {
      expenses: [],
      filters: { caseId, category, status },
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const expensesApi = new ExpensesApiService();

  switch (intent) {
    case "approve": {
      const approveId = formData.get("id") as string;
      try {
        await expensesApi.approve(approveId);
        return { success: true, message: "Expense approved" };
      } catch {
        return { success: false, error: "Failed to approve expense" };
      }
    }

    case "delete": {
      const deleteId = formData.get("id") as string;
      try {
        await expensesApi.delete(deleteId);
        return { success: true, message: "Expense deleted" };
      } catch {
        return { success: false, error: "Failed to delete expense" };
      }
    }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function ExpensesRoute() {
  const { expenses, filters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Expenses
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Track billable and non-billable expenses
          </p>
        </div>

        <Link
          to="/billing/expenses/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Expense
        </Link>
      </div>

      {/* Action Result */}
      {actionData?.message && (
        <div className={`mb-4 rounded-md p-4 ${actionData.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {actionData.message}
        </div>
      )}

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
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
      title="Failed to Load Expenses"
      message="We couldn't load the expenses. Please try again."
      backTo="/billing"
      backLabel="Return to Billing"
    />
  );
}
