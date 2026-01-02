/**
 * Trial Exhibits List Page - Server Component with Data Fetching
 * Manage trial exhibits, admissibility, and objections
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Trial Exhibits | LexiFlow',
  description: 'Trial exhibits and evidence management',
};

async function TrialExhibitsList() {
  const exhibits = await apiFetch(API_ENDPOINTS.TRIAL_EXHIBITS.LIST) as any[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Exhibit #</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Admitted</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Objections</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {exhibits.map((exhibit: any) => (
            <tr key={exhibit.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {exhibit.exhibitNumber}
              </td>
              <td className="px-6 py-4 text-sm text-slate-900 dark:text-slate-100">
                {exhibit.description}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {exhibit.caseName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${exhibit.admitted
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                  }`}>
                  {exhibit.admitted ? 'Admitted' : 'Pending'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {exhibit.objectionsCount > 0 ? (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    {exhibit.objectionsCount} objection{exhibit.objectionsCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <Link href={`/trial-exhibits/${exhibit.id}`} className="text-blue-600 hover:underline">
                  View
                </Link>
                <Link href={`/documents/${exhibit.documentId}`} className="text-emerald-600 hover:underline">
                  Document
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="animate-pulse bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export default function TrialExhibitsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Trial Exhibits</h1>
        <Link
          href="/trial-exhibits/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Exhibit
        </Link>
      </div>
      <Suspense fallback={<LoadingState />}>
        <TrialExhibitsList />
      </Suspense>
    </div>
  );
}
