/**
 * Rules Page - Server Component with Data Fetching
 * Court rules and procedures reference with backend data
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Rules | LexiFlow',
  description: 'Court rules and procedures reference',
};

export default async function RulesPage(): Promise<React.JSX.Element> {
  // Fetch court rules and jurisdictions
  let jurisdictions = [];

  try {
    jurisdictions = await apiFetch(API_ENDPOINTS.JURISDICTIONS.LIST);
  } catch (error) {
    console.error('Failed to load rules:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Court Rules</h1>
      <Suspense fallback={<div>Loading rules...</div>}>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          {jurisdictions && jurisdictions.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Available Jurisdictions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {jurisdictions.map((jurisdiction: any) => (
                  <div key={jurisdiction.id} className="p-4 border rounded hover:shadow-md transition-shadow cursor-pointer">
                    <h3 className="font-semibold">{jurisdiction.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{jurisdiction.type || 'Jurisdiction'}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No rules data available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
