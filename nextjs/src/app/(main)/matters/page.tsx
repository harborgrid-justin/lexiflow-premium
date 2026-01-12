/**
 * Matters List Page - Server Component with Data Fetching
 * List view of all matters
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Matters | LexiFlow',
  description: 'Manage legal matters and engagements',
};

export default async function MattersPage(): Promise<React.JSX.Element> {
  // Fetch matters from backend
  let matters: any[] = [];

  try {
    matters = await apiFetch(API_ENDPOINTS.MATTERS.LIST) as any[];
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Matters</h1>
        <Link
          href="/matters/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Matter
        </Link>
      </div>

      <Suspense fallback={<div>Loading matters...</div>}>
        <div className="grid grid-cols-1 gap-4">
          {matters && matters.length > 0 ? (
            matters.map((matter: any) => (
              <Link
                key={matter.id}
                href={`/matters/${matter.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{matter.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      Matter #{matter.matterNumber} • {matter.clientName}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{matter.type}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900">
                      {matter.status}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {matter.caseCount || 0} cases
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No matters available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
