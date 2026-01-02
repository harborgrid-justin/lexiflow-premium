/**
 * Expert Witnesses List Page - Server Component with Data Fetching
 * Manage expert witnesses and consultants
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Expert Witnesses | LexiFlow',
  description: 'Expert witness and consultant management',
};

async function ExpertWitnessesList() {
  const experts = await apiFetch(API_ENDPOINTS.EXPERT_WITNESSES.LIST) as any[];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Specialty</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cases</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Hourly Rate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {experts.map((expert: any) => (
            <tr key={expert.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {expert.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {expert.specialty}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {expert.casesCount || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100 font-semibold">
                ${expert.hourlyRate?.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link href={`/expert-witnesses/${expert.id}`} className="text-blue-600 hover:underline">
                  View Profile
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ExpertWitnessesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Expert Witnesses</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Expert
        </button>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading expert witnesses...</div>}>
        <ExpertWitnessesList />
      </Suspense>
    </div>
  );
}
