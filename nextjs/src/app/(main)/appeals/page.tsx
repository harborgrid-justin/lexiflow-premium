/**
 * Appeals Page - Server Component with Data Fetching
 * List of all appellate cases
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Appeals | LexiFlow',
  description: 'Manage appellate cases and proceedings',
};

export default async function AppealsPage(): Promise<React.JSX.Element> {
  let appeals: any[] = [];

  try {
    appeals = await apiFetch(API_ENDPOINTS.APPEALS.LIST) as any[];
  } catch (error) {
    console.error('Failed to load appeals:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Appeals</h1>
        <Link
          href="/appeals/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Appeal
        </Link>
      </div>

      <Suspense fallback={<div>Loading appeals...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Case
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Court
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Notice Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {appeals && appeals.length > 0 ? (
                appeals.map((appeal: any) => (
                  <tr key={appeal.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/appeals/${appeal.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {appeal.caseName || appeal.caseNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{appeal.court}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appeal.noticeDate
                        ? new Date(appeal.noticeDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-sm rounded ${appeal.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          : appeal.status === 'filed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : appeal.status === 'closed'
                              ? 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}
                      >
                        {appeal.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No appeals found
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
