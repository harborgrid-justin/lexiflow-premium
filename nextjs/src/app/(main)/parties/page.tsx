/**
 * Parties List Page - Server Component with Data Fetching
 * List view of all parties
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Parties | LexiFlow',
  description: 'Manage parties and attorneys',
};

export default async function PartiesPage() {
  // Fetch parties from backend
  let parties = [];

  try {
    parties = await apiFetch(API_ENDPOINTS.PARTIES.LIST);
  } catch (error) {
    console.error('Failed to load parties:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Parties & Attorneys</h1>
        <Link
          href="/parties/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Party
        </Link>
      </div>

      <Suspense fallback={<div>Loading parties...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parties && parties.length > 0 ? (
            parties.map((party: any) => (
              <Link
                key={party.id}
                href={`/parties/${party.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{party.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{party.type}</p>
                <p className="text-xs text-slate-500 mt-1">{party.role}</p>
              </Link>
            ))
          ) : (
            <p className="col-span-3 text-slate-600 dark:text-slate-400">No parties available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
