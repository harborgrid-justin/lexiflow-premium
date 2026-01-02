/**
 * Statute Tracker Page - Server Component with Data Fetching
 * Tracks statute of limitations for cases
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Statute Tracker | LexiFlow',
  description: 'Track statute of limitations deadlines',
};

export default async function StatuteTrackerPage(): Promise<React.JSX.Element> {
  let statutes = [];

  try {
    statutes = await apiFetch(API_ENDPOINTS.STATUTE_TRACKER.LIST);
  } catch (error) {
    console.error('Failed to load statute tracker:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Statute of Limitations Tracker</h1>
        <Link
          href="/statute-tracker/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Statute
        </Link>
      </div>

      <Suspense fallback={<div>Loading statutes...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Case
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Statute Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Days Remaining
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {statutes && statutes.length > 0 ? (
                statutes.map((statute: any) => {
                  const daysRemaining = Math.ceil(
                    (new Date(statute.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  const isUrgent = daysRemaining <= 30;
                  const isExpired = daysRemaining < 0;

                  return (
                    <tr key={statute.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/cases/${statute.caseId}`}
                          className="text-blue-600 hover:underline"
                        >
                          {statute.caseName || statute.caseNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{statute.statuteType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(statute.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-sm rounded ${isExpired
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : isUrgent
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}
                        >
                          {isExpired ? 'EXPIRED' : `${daysRemaining} days`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No statute trackers found
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
