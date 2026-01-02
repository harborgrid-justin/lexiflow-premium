/**
 * Conflicts List Page - Server Component with Data Fetching
 * Lists all conflict checks with type, parties, cleared date, resolution
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Conflict Checks | LexiFlow',
  description: 'Manage conflict of interest checks',
};

export default async function ConflictsPage(): Promise<React.JSX.Element> {
  let conflicts: any[] = [];

  try {
    conflicts = await apiFetch(API_ENDPOINTS.CONFLICTS.LIST) as any[];
  } catch (error) {
    console.error('Failed to load conflicts:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Conflict Checks</h1>
        <Link
          href="/conflicts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Conflict Check
        </Link>
      </div>

      <Suspense fallback={<div>Loading conflicts...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Conflict ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Parties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Cleared Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Resolution
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {conflicts && conflicts.length > 0 ? (
                conflicts.map((conflict: any) => (
                  <tr key={conflict.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/conflicts/${conflict.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {conflict.conflictNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                        {conflict.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{conflict.parties?.join(', ')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${conflict.status === 'Cleared'
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                          : conflict.status === 'Flagged'
                            ? 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                            : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                          }`}
                      >
                        {conflict.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {conflict.clearedDate
                        ? new Date(conflict.clearedDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {conflict.resolution || '—'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No conflict checks found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Suspense>
    </div>
  );
}
