/**
 * Engagement Letters List Page - Server Component
 * Lists client engagement letters
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Engagement Letters | LexiFlow',
  description: 'Client engagement letters management',
};

interface EngagementLetter {
  id: string;
  client: string;
  scope: string;
  feeStructure: string;
  signedStatus: boolean;
  sentDate: string;
  signedDate?: string;
  totalFee?: number;
}

async function EngagementLettersList() {
  const letters: EngagementLetter[] = await apiFetch(API_ENDPOINTS.ENGAGEMENT_LETTERS.LIST);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Scope
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Fee Structure
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Sent Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {letters.map((letter) => (
              <tr key={letter.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/engagement-letters/${letter.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {letter.client}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900 dark:text-slate-50">
                    {letter.scope.length > 60
                      ? `${letter.scope.substring(0, 60)}...`
                      : letter.scope}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  {letter.feeStructure}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                  {new Date(letter.sentDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {letter.signedStatus ? (
                    <div className="flex flex-col">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-700">
                        Signed
                      </span>
                      {letter.signedDate && (
                        <span className="text-xs text-slate-500 mt-1">
                          {new Date(letter.signedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-700">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {letters.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No engagement letters found. Create your first engagement letter.
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}

export default async function EngagementLettersPage(): Promise<React.JSX.Element> {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Engagement Letters
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Client engagement and retainer agreements
          </p>
        </div>
        <Link
          href="/engagement-letters/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Letter
        </Link>
      </div>

      <Suspense fallback={<LoadingState />}>
        <EngagementLettersList />
      </Suspense>
    </div>
  );
}
