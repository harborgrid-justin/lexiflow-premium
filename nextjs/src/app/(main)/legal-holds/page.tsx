/**
 * Legal Holds List Page - Server Component with Data Fetching
 * List view of all legal holds
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Legal Holds | LexiFlow',
  description: 'Manage legal holds and preservation notices',
};

export default async function LegalHoldsPage(): Promise<React.JSX.Element> {
  // Fetch legal holds from backend
  let legalHolds: any[] = [];

  try {
    legalHolds = await apiFetch(API_ENDPOINTS.LEGAL_HOLDS.LIST) as any[];
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Legal Holds</h1>
        <Link
          href="/legal-holds/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Issue Legal Hold
        </Link>
      </div>

      <Suspense fallback={<div>Loading legal holds...</div>}>
        <div className="space-y-3">
          {legalHolds && legalHolds.length > 0 ? (
            legalHolds.map((hold: any) => (
              <Link
                key={hold.id}
                href={`/legal-holds/${hold.id}`}
                className="block p-4 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{hold.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Issued: {hold.issuedDate}
                    </p>
                  </div>
                  <span className="px-3 py-1 text-sm rounded bg-amber-100 dark:bg-amber-900">
                    {hold.status}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No legal holds available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
