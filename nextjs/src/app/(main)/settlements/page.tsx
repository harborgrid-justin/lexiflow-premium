/**
 * Settlements List Page - Server Component with Data Fetching
 * List view of all settlements
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Settlements | LexiFlow',
  description: 'Manage settlements and offers',
};

interface Settlement {
  id: string;
  offerAmount: number;
  party: string;
  date: string;
  acceptanceStatus: string;
  caseNumber: string;
  offerType: string;
}

export default async function SettlementsPage(): Promise<JSX.Element> {
  // Fetch settlements from backend
  let settlements: Settlement[] = [];

  try {
    settlements = await apiFetch(API_ENDPOINTS.SETTLEMENTS.LIST);
  } catch (error) {
    console.error('Failed to load settlements:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Settlements</h1>
        <Link
          href="/settlements/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Settlement Offer
        </Link>
      </div>

      <Suspense fallback={<div>Loading settlements...</div>}>
        <div className="grid grid-cols-1 gap-4">
          {settlements && settlements.length > 0 ? (
            settlements.map((settlement) => (
              <Link
                key={settlement.id}
                href={`/settlements/${settlement.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{settlement.offerType}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Case: {settlement.caseNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">Party: {settlement.party}</p>
                    <p className="text-xs text-slate-500">Date: {settlement.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${settlement.offerAmount.toLocaleString()}
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      {settlement.acceptanceStatus}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No settlements available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
