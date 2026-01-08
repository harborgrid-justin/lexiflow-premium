/**
 * Case Operations Page - Server Component with Data Fetching
 * Case operational management tools with backend data
 */
import React from 'react';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Case Operations | LexiFlow',
  description: 'Case operational management tools',
};

export default async function CaseOperationsPage(): Promise<React.JSX.Element> {
  // Fetch case operations data
  let operations = [];

  try {
    operations = await apiFetch('/case-operations');
  } catch (error) {
    console.error('Failed to load case operations:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Case Operations</h1>
      <Suspense fallback={<div>Loading operations...</div>}>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          {operations && operations.length > 0 ? (
            <div className="space-y-4">
              {operations.map((op: any) => (
                <div key={op.id} className="p-4 border rounded">
                  <h3 className="font-semibold">{op.title || op.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {op.description}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No operations data available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
