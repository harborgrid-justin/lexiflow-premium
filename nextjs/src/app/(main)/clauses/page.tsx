/**
 * Clauses Page - Server Component with Data Fetching
 * Fetches clause library from backend
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Clauses',
  description: 'Manage clause library and templates',
};

export default async function ClausesPage(): Promise<JSX.Element> {
  // Fetch clauses from backend
  let clauses = [];

  try {
    clauses = await apiFetch(API_ENDPOINTS.CLAUSES.LIST);
  } catch (error) {
    console.error('Failed to load clauses:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Clause Library</h1>
      <Suspense fallback={<div>Loading clauses...</div>}>
        {clauses && clauses.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {clauses.map((clause: any) => (
              <div key={clause.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                <h3 className="font-semibold">{clause.title || clause.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {clause.description || 'No description'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">No clauses available</p>
        )}
      </Suspense>
    </div>
  );
}
