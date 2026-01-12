/**
 * Drafting Page - Server Component with Data Fetching
 * Fetches drafting templates from backend
 */
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import React, { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Drafting | LexiFlow',
  description: 'Document drafting and templates',
};

export default async function DraftingPage(): Promise<React.JSX.Element> {
  // Fetch templates from backend
  let templates = [];

  try {
    templates = await apiFetch(API_ENDPOINTS.DRAFTING.TEMPLATES);
  } catch (error) {
    // Silent error handling when backend is unavailable (logging disabled to reduce console noise)
    // Templates will remain empty array and UI will show "No templates available"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Drafting</h1>
      <Suspense fallback={<div>Loading templates...</div>}>
        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template: any) => (
              <div key={template.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border">
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {template.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">No templates available</p>
        )}
      </Suspense>
    </div>
  );
}
