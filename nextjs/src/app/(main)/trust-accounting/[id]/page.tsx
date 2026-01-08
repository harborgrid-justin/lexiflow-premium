/**
 * Trust Account Detail Page - Server Component with Data Fetching
 * Dynamic route for individual trust account view
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface TrustAccountDetailPageProps {
  params: Promise<{ id: string }>;
}

interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  balance: number;
  description: string;
  reference: string;
}

interface TrustAccountDetail {
  id: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  lastTransaction: string;
  reconciliationStatus: string;
  transactionCount: number;
  clientName: string;
  transactions: Transaction[];
  lastReconciliationDate: string;
  bankName: string;
  routingNumber: string;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for trust-accounting detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of trust-accounting IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.TRUST_ACCOUNTING.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch trust-accounting list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: TrustAccountDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const account = await apiFetch(API_ENDPOINTS.TRUST_ACCOUNTING.DETAIL(id)) as TrustAccountDetail;
    return {
      title: `${account.accountName} | LexiFlow`,
      description: `Trust account for ${account.clientName}`,
    };
  } catch (error) {
    return { title: 'Trust Account Not Found' };
  }
}

export default async function TrustAccountDetailPage({ params }: TrustAccountDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let account: TrustAccountDetail;
  try {
    account = await apiFetch(API_ENDPOINTS.TRUST_ACCOUNTING.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading trust account...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{account.accountName}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Client: {account.clientName}</p>
              <p className="text-slate-600 dark:text-slate-400">Account: {account.accountNumber}</p>
              <p className="text-slate-600 dark:text-slate-400">Bank: {account.bankName}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                ${account.balance.toLocaleString()}
              </div>
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {account.reconciliationStatus}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t pt-4 mb-6">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Last Transaction:</span>
              <span className="ml-2">{account.lastTransaction}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Last Reconciliation:</span>
              <span className="ml-2">{account.lastReconciliationDate}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Total Transactions:</span>
              <span className="ml-2">{account.transactionCount}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-slate-900">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Reference</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2 text-right">Amount</th>
                      <th className="px-4 py-2 text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.transactions && account.transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-t border-slate-200 dark:border-slate-700">
                        <td className="px-4 py-2">{transaction.date}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${transaction.type === 'debit'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                            }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-mono text-sm">{transaction.reference}</td>
                        <td className="px-4 py-2">{transaction.description}</td>
                        <td className={`px-4 py-2 text-right font-semibold ${transaction.type === 'debit' ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                          {transaction.type === 'debit' ? '-' : '+'}${Math.abs(transaction.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold">
                          ${transaction.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded">
              <h3 className="font-semibold mb-2">Bank Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Bank:</span>
                  <span className="ml-2">{account.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Routing:</span>
                  <span className="ml-2 font-mono">{account.routingNumber}</span>
                </div>
                <div>
                  <span className="text-slate-600 dark:text-slate-400">Account:</span>
                  <span className="ml-2 font-mono">{account.accountNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Reconcile Account
            </button>
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Add Transaction
            </button>
            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
              Export Statement
            </button>
          </div>

          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-1">IOLTA Compliance Notice</h3>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              This trust account must be reconciled monthly. All client funds must be held separately and properly documented per bar regulations.
            </p>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
