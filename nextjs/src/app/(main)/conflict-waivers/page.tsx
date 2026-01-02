/**
 * Conflict Waivers List Page - Server Component with Data Fetching
 * Manage client conflict waivers and conflict resolution
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Conflict Waivers | LexiFlow',
  description: 'Client conflict waivers and conflict resolution management',
};

async function ConflictWaiversList() {
  const waivers = await apiFetch(API_ENDPOINTS.CONFLICT_WAIVERS.LIST);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Conflict Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Signed Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {waivers.map((waiver: any) => (
            <tr key={waiver.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {waiver.clientName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {waiver.conflictType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {new Date(waiver.signedDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${waiver.status === 'Active'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                  {waiver.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                <Link
                  href={`/conflict-waivers/${waiver.id}`}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
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

function LoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export default function ConflictWaiversPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Conflict Waivers</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage client conflict waivers and resolution</p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ConflictWaiversList />
      </Suspense>
    </div>
  );
}
