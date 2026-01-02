/**
 * Judgments Page - Server Component with Data Fetching
 * List of court judgments and enforcement
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Judgments | LexiFlow',
  description: 'Track court judgments and enforcement',
};

export default async function JudgmentsPage(): Promise<React.JSX.Element> {
  let judgments: any[] = [];

  try {
    judgments = await apiFetch(API_ENDPOINTS.JUDGMENTS.LIST) as any[];
  } catch (error) {
    console.error('Failed to load judgments:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Judgments</h1>
        <Link
          href="/judgments/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Judgment
        </Link>
      </div>

      <Suspense fallback={<div>Loading judgments...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Debtor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Enforcement
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {judgments && judgments.length > 0 ? (
                judgments.map((judgment: any) => (
                  <tr key={judgment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/judgments/${judgment.id}`}
                        className="text-blue-600 hover:underline font-semibold"
                      >
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(judgment.amount || 0)}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {judgment.debtor || judgment.defendant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {judgment.date ? new Date(judgment.date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 text-sm rounded ${judgment.enforcement === 'collected'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : judgment.enforcement === 'in-progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : judgment.enforcement === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                      >
                        {judgment.enforcement || 'Not Started'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No judgments found
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
