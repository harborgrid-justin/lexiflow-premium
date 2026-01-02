/**
 * Jurisdiction Page - Server Component with Data Fetching
 * Manage jurisdictions and court information
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Jurisdiction | LexiFlow',
  description: 'Manage jurisdictions and court information',
};

export default async function JurisdictionPage() {
  // Fetch jurisdictions from backend
  let jurisdictions = [];

  try {
    jurisdictions = await apiFetch(API_ENDPOINTS.JURISDICTIONS.LIST);
  } catch (error) {
    console.error('Failed to load jurisdictions:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Jurisdictions</h1>
      <Suspense fallback={<div>Loading jurisdictions...</div>}>
        {jurisdictions && jurisdictions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jurisdictions.map((jurisdiction: any) => (
              <div key={jurisdiction.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                <h3 className="font-semibold">{jurisdiction.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {jurisdiction.type || 'N/A'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">No jurisdictions available</p>
        )}
      </Suspense>
    </div>
  );
}
