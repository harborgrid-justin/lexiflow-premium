/**
 * Database Control Page - Server Component with Data Fetching
 * Admin interface for database management
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Database Control | LexiFlow',
  description: 'Database administration and control',
};

export default async function DatabaseControlPage() {
  // Fetch database schema info
  let schemaInfo = null;

  try {
    schemaInfo = await apiFetch(API_ENDPOINTS.SCHEMA.TABLES);
  } catch (error) {
    console.error('Failed to load schema:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">Database Control</h1>
      <Suspense fallback={<div>Loading database info...</div>}>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
          <p className="text-slate-600 dark:text-slate-400">Database management interface</p>
          {schemaInfo && (
            <div className="mt-4">
              <p className="text-sm">Schema loaded successfully</p>
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
}
