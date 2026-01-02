/**
 * Entity Director Page - Server Component with Data Fetching
 * Legal entity management and directory with backend data
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Entity Director | LexiFlow',
  description: 'Legal entity management and directory',
};

export default async function EntityDirectorPage(): Promise<JSX.Element> {
  // Fetch legal entities
  let entities = [];

  try {
    entities = await apiFetch(API_ENDPOINTS.LEGAL_ENTITIES.LIST);
  } catch (error) {
    console.error('Failed to load entities:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Entity Director</h1>
      <Suspense fallback={<div>Loading entities...</div>}>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          {entities && entities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entities.map((entity: any) => (
                <div key={entity.id} className="p-4 border rounded hover:shadow-md transition-shadow">
                  <h3 className="font-semibold">{entity.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{entity.type || 'Entity'}</p>
                  <p className="text-xs text-slate-500 mt-1">{entity.jurisdiction || 'N/A'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No entities available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
