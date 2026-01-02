/**
 * Payment Plans List Page - Server Component with Data Fetching
 * Manage client payment plans with installments and balances
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Payment Plans | LexiFlow',
  description: 'Client payment plan management with installment tracking',
};

async function PaymentPlansList() {
  const plans = await apiFetch(API_ENDPOINTS.PAYMENT_PLANS.LIST) as any[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Installments</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {plans.map((plan: any) => (
            <tr key={plan.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {plan.clientName || 'Unknown Client'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 font-semibold">
                ${plan.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {plan.paidInstallments || 0} / {plan.totalInstallments || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 font-semibold">
                ${plan.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${plan.status === 'Active'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : plan.status === 'Completed'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                  {plan.status || 'Active'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link
                  href={`/payment-plans/${plan.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {plans.length === 0 && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No payment plans found
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
      </div>
    </div>
  );
}

export default async function PaymentPlansPage(): Promise<JSX.Element> {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Payment Plans</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage client payment plans and track installment payments
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Create Payment Plan
        </button>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <PaymentPlansList />
      </Suspense>
    </div>
  );
}
