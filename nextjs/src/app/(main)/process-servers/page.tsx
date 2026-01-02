/**
 * Process Servers List Page - Server Component with Data Fetching
 * Manage process servers and service tracking
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Process Servers | LexiFlow',
  description: 'Process server management and tracking',
};

async function ProcessServersList() {
  const servers = await apiFetch(API_ENDPOINTS.PROCESS_SERVERS.LIST);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service Area</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Success Rate</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Jobs</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
          {servers.map((server: any) => (
            <tr key={server.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                {server.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                {server.serviceArea}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`font-semibold ${server.successRate >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                  {server.successRate}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                {server.activeJobs || 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <Link href={`/process-servers/${server.id}`} className="text-blue-600 hover:underline">
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

export default function ProcessServersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Process Servers</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Add Server
        </button>
      </div>

      <Suspense fallback={<div className="text-center py-12">Loading process servers...</div>}>
        <ProcessServersList />
      </Suspense>
    </div>
  );
}
