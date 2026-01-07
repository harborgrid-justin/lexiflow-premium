/**
 * Payment Plan Detail Page - Server Component with Data Fetching
 * Detailed view of payment plan with schedule, transactions, and auto-pay settings
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Payment Plan Details | LexiFlow',
  description: 'Payment plan schedule, transactions, and auto-pay configuration',
};

async function PaymentPlanDetails({ id }: { id: string }) {
  const plan = await apiFetch(API_ENDPOINTS.PAYMENT_PLANS.DETAIL(id)) as any;
  const schedule = await apiFetch(API_ENDPOINTS.PAYMENT_PLANS.SCHEDULE(id)) as any[];
  const transactions = await apiFetch(API_ENDPOINTS.PAYMENT_PLANS.TRANSACTIONS(id)) as any[];

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          {plan.clientName || 'Payment Plan'}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Total Amount:</span>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              ${plan.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Balance:</span>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              ${plan.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </div>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Installments:</span>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {plan.paidInstallments || 0} / {plan.totalInstallments || 0}
            </div>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Status:</span>
            <div>
              <span className={`inline-block px-3 py-1 mt-1 rounded-full text-sm font-semibold ${plan.status === 'Active'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : plan.status === 'Completed'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                {plan.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Pay Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Auto-Pay Settings
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 dark:text-slate-400">Auto-Pay Enabled:</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${plan.autoPayEnabled
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
              }`}>
              {plan.autoPayEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Payment Method:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100">
              {plan.paymentMethod || 'Not Set'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Next Payment Date:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100 font-semibold">
              {plan.nextPaymentDate ? new Date(plan.nextPaymentDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400">Next Payment Amount:</span>
            <span className="ml-2 text-slate-900 dark:text-slate-100 font-semibold">
              ${plan.nextPaymentAmount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Payment Schedule
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Installment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {schedule.map((item: any, idx: number) => (
                <tr key={item.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                    #{idx + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
                    ${item.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'Paid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : item.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                      }`}>
                      {item.status || 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Transaction History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {transactions.map((txn: any) => (
                <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {txn.date ? new Date(txn.date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                    {txn.description || 'Payment'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                    ${txn.amount?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {txn.method || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {transactions.length === 0 && (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            No transactions recorded
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-4 gap-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for payment-plans detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of payment-plans IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.PAYMENT_PLANS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch payment-plans list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export default async function PaymentPlanDetailPage({ params }: { params: { id: string } }): Promise<React.JSX.Element> {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/payment-plans"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2 inline-block"
          >
            ← Back to Payment Plans
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Payment Plan Details</h1>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            Edit Plan
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Record Payment
          </button>
        </div>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <PaymentPlanDetails id={id} />
      </Suspense>
    </div>
  );
}
