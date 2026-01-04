/**
 * Trust Accounts Route
 * Displays IOLTA trust accounts with compliance features
 */

import { TrustAccountsApiService } from '@/api/billing';
import { TrustAccountDashboard } from '@/features/operations/billing/trust/TrustAccountDashboard';
import { Link, useLoaderData, type LoaderFunctionArgs } from 'react-router';
import { RouteErrorBoundary } from '../_shared/RouteErrorBoundary';
import { createListMeta } from '../_shared/meta-utils';

// ============================================================================
// Meta Tags
// ============================================================================

export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) {
  return createListMeta({
    entityType: 'Trust Accounts',
    count: data?.accounts?.length,
    description: 'Manage IOLTA trust accounts with compliance',
  });
}

// ============================================================================
// Loader
// ============================================================================

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get('clientId');
  const status = url.searchParams.get('status');

  const trustApi = new TrustAccountsApiService();

  try {
    const accounts = await trustApi.getAll({
      clientId: clientId || undefined,
      status: (status as 'active' | 'inactive' | 'closed' | 'suspended') || undefined,
    });

    return {
      accounts,
      filters: { clientId, status },
    };
  } catch (error) {
    console.error('Failed to load trust accounts:', error);
    return {
      accounts: [],
      filters: { clientId, status },
    };
  }
}

// ============================================================================
// Action
// ============================================================================

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const trustApi = new TrustAccountsApiService();

  switch (intent) {
    case "deposit": {
      const depositAccountId = formData.get("accountId") as string;
      const depositData = {
        amount: parseFloat(formData.get("amount") as string),
        transactionDate: formData.get("date") as string,
        description: formData.get("description") as string,
        checkNumber: formData.get("checkNumber") as string || undefined,
        payorName: formData.get("payorName") as string,
        matterReference: formData.get("matterReference") as string || undefined,
      };
      try {
        await trustApi.deposit(depositAccountId, depositData);
        return { success: true, message: "Deposit recorded" };
      } catch {
        return { success: false, error: "Failed to record deposit" };
      }
    }

    case "withdrawal": {
      const withdrawAccountId = formData.get("accountId") as string;
      const withdrawData = {
        amount: parseFloat(formData.get("amount") as string),
        transactionDate: formData.get("date") as string,
        description: formData.get("description") as string,
        checkNumber: formData.get("checkNumber") as string || undefined,
        payeeName: formData.get("payeeName") as string,
        purpose: formData.get("purpose") as 'payment_to_client' | 'payment_to_vendor' | 'fee_transfer' | 'other',
      };
      try {
        await trustApi.withdraw(withdrawAccountId, withdrawData);
        return { success: true, message: "Withdrawal recorded" };
      } catch {
        return { success: false, error: "Failed to record withdrawal" };
      }
    }

    case "reconcile": {
      const reconcileAccountId = formData.get("accountId") as string;
      const reconcileData = {
        reconciliationDate: (formData.get("reconciliationDate") as string),
        bankStatementBalance: parseFloat(formData.get("bankStatementBalance") as string),
        mainLedgerBalance: parseFloat(formData.get("mainLedgerBalance") as string),
        clientLedgersTotalBalance: parseFloat(formData.get("clientLedgersTotalBalance") as string),
        outstandingChecks: JSON.parse(formData.get("outstandingChecks") as string || '[]'),
        depositsInTransit: JSON.parse(formData.get("depositsInTransit") as string || '[]'),
      };
      try {
        await trustApi.reconcile(reconcileAccountId, reconcileData);
        return { success: true, message: "Reconciliation completed" };
      } catch {
        return { success: false, error: "Failed to complete reconciliation" };
      }
    }

    default:
      return { success: false, error: "Invalid action" };
  }
}

// ============================================================================
// Component
// ============================================================================

export default function TrustAccountsRoute({ actionData }: Route.ComponentProps) {
  const { accounts: _accounts, filters: _filters } = useLoaderData() as Route.ComponentProps['loaderData'];

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Trust Accounts (IOLTA)
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage client trust funds with compliance features
          </p>
        </div>

        <Link
          to="/billing/trust/new"
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Trust Account
        </Link>
      </div>

      {/* Action Result */}
      {actionData?.message && (
        <div className={`mb-4 rounded-md p-4 ${actionData.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {actionData.message}
        </div>
      )}

      {/* Trust Account Dashboard */}
      <TrustAccountDashboard />
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
      title="Failed to Load Trust Accounts"
      message="We couldn't load the trust accounts. Please try again."
      backTo="/billing"
      backLabel="Return to Billing"
    />
  );
}
