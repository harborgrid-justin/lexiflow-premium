/**
 * Depositions List Page - Server Component with Data Fetching
 * List view of all depositions
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Depositions | LexiFlow',
  description: 'Manage depositions and transcripts',
};

export default async function DepositionsPage() {
  // Fetch depositions from backend
  let depositions = [];

  try {
    depositions = await apiFetch(API_ENDPOINTS.DEPOSITIONS.LIST);
  } catch (error) {
    console.error('Failed to load depositions:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Depositions</h1>
        <Link
          href="/depositions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Schedule Deposition
        </Link>
      </div>

      <Suspense fallback={<div>Loading depositions...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {depositions && depositions.length > 0 ? (
            depositions.map((depo: any) => (
              <Link
                key={depo.id}
                href={`/depositions/${depo.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{depo.deponentName}</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-slate-600 dark:text-slate-400">Date: {depo.date}</p>
                  <p className="text-slate-600 dark:text-slate-400">Location: {depo.location}</p>
                  <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900">
                    {depo.status}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-2 text-slate-600 dark:text-slate-400">No depositions available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
