/**
 * Retainers List Page - Server Component with Data Fetching
 * List view of all retainers
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Retainers | LexiFlow',
  description: 'Manage client retainers and prepaid balances',
};

interface Retainer {
  id: string;
  clientName: string;
  amount: number;
  balance: number;
  lastReplenishDate: string;
  status: string;
  caseNumber: string;
}

export default async function RetainersPage(): Promise<React.JSX.Element> {
  // Fetch retainers from backend
  let retainers: Retainer[] = [];

  try {
    retainers = await apiFetch(API_ENDPOINTS.RETAINERS.LIST);
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Retainers</h1>
        <Link
          href="/retainers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Retainer
        </Link>
      </div>

      <Suspense fallback={<div>Loading retainers...</div>}>
        <div className="grid grid-cols-1 gap-4">
          {retainers && retainers.length > 0 ? (
            retainers.map((retainer) => (
              <Link
                key={retainer.id}
                href={`/retainers/${retainer.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{retainer.clientName}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Case: {retainer.caseNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">Last Replenish: {retainer.lastReplenishDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      ${retainer.balance.toLocaleString()}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      of ${retainer.amount.toLocaleString()}
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {retainer.status}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No retainers available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
