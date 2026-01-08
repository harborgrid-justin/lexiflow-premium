/**
 * Jury Selection List Page - Server Component with Data Fetching
 * Manage jury selection for active trials
 */
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Jury Selection | LexiFlow',
  description: 'Jury selection and voir dire management',
};

async function JurySelectionList() {
  const selections = await apiFetch(API_ENDPOINTS.JURY_SELECTION.LIST) as any[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trial Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Jurors Count</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {selections.map((selection: any) => (
            <tr key={selection.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {selection.caseName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {new Date(selection.trialDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {selection.jurorsCount || 0} jurors
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selection.status === 'Completed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : selection.status === 'In Progress'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'
                  }`}>
                  {selection.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link href={`/jury-selection/${selection.id}`} className="text-blue-600 hover:underline">
                  View Details
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

export default function JurySelectionPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Jury Selection</h1>
        <Link
          href="/jury-selection/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          New Selection
        </Link>
      </div>
      <Suspense fallback={<LoadingState />}>
        <JurySelectionList />
      </Suspense>
    </div>
  );
}
