/**
 * Admissions List Page - Server Component with Data Fetching
 * List view of all admissions requests
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Requests for Admission | LexiFlow',
  description: 'Manage requests for admission and responses',
};

export default async function AdmissionsPage() {
  // Fetch admissions from backend
  let admissions = [];

  try {
    admissions = (await apiFetch(API_ENDPOINTS.ADMISSIONS.LIST)) as any[];
  } catch (error) {
    console.error('Failed to load admissions:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Requests for Admission</h1>
        <Link
          href="/admissions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New
        </Link>
      </div>

      <Suspense fallback={<div>Loading admissions...</div>}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {admissions && admissions.length > 0 ? (
            admissions.map((item: any) => (
              <Link
                key={item.id}
                href={`/admissions/${item.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <span className="px-3 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900">
                    {item.status}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Matter:</span>
                    <span className="ml-2 text-slate-700 dark:text-slate-300">{item.matter}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Response Deadline:</span>
                    <span className="ml-2 text-slate-700 dark:text-slate-300">{item.responseDeadline}</span>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <span className="text-slate-600 dark:text-slate-400">
                      {item.totalRequests || 0} requests
                    </span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="col-span-full text-center text-slate-600 dark:text-slate-400 py-8">
              No admission requests available
            </p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
