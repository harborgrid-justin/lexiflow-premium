/**
 * Trust Accounting List Page - Server Component with Data Fetching
 * List view of all trust accounts
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Trust Accounting | LexiFlow',
  description: 'Manage trust accounts and IOLTA compliance',
};

interface TrustAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  lastTransaction: string;
  reconciliationStatus: string;
  transactionCount: number;
  clientName: string;
}

export default async function TrustAccountingPage() {
  // Fetch trust accounts from backend
  let accounts: TrustAccount[] = [];

  try {
    accounts = await apiFetch(API_ENDPOINTS.TRUST_ACCOUNTING.LIST);
  } catch (error) {
    console.error('Failed to load trust accounts:', error);
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Trust Accounting</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Total Trust Balance: <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-400">${totalBalance.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/trust-accounting/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            New Account
          </Link>
          <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
            Reconcile All
          </button>
        </div>
      </div>

      <Suspense fallback={<div>Loading trust accounts...</div>}>
        <div className="grid grid-cols-1 gap-4">
          {accounts && accounts.length > 0 ? (
            accounts.map((account) => (
              <Link
                key={account.id}
                href={`/trust-accounting/${account.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{account.accountName}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Client: {account.clientName}</p>
                    <p className="text-xs text-slate-500 mt-1">Account: {account.accountNumber}</p>
                    <p className="text-xs text-slate-500">Last Transaction: {account.lastTransaction}</p>
                    <p className="text-xs text-slate-500">{account.transactionCount} transactions</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${account.balance.toLocaleString()}
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {account.reconciliationStatus}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No trust accounts available</p>
          )}
        </div>
      </Suspense>

      <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <h2 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">IOLTA Compliance</h2>
        <p className="text-sm text-amber-800 dark:text-amber-300">
          All trust accounts must maintain accurate records and be reconciled monthly per bar association regulations.
        </p>
      </div>
    </div>
  );
}
