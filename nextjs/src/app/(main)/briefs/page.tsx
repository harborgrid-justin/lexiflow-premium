/**
 * Briefs List Page - Server Component with Data Fetching
 * List view of all briefs
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Briefs | LexiFlow',
  description: 'Manage legal briefs and filings',
};

interface Brief {
  id: string;
  briefType: string;
  dueDate: string;
  wordCount: number;
  filedStatus: string;
  caseNumber: string;
  author: string;
}

export default async function BriefsPage(): Promise<React.JSX.Element> {
  // Fetch briefs from backend
  let briefs: Brief[] = [];

  try {
    briefs = await apiFetch(API_ENDPOINTS.BRIEFS.LIST);
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Briefs</h1>
        <Link
          href="/briefs/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create Brief
        </Link>
      </div>

      <Suspense fallback={<div>Loading briefs...</div>}>
        <div className="grid grid-cols-1 gap-4">
          {briefs && briefs.length > 0 ? (
            briefs.map((brief) => (
              <Link
                key={brief.id}
                href={`/briefs/${brief.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{brief.briefType}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Case: {brief.caseNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">Author: {brief.author}</p>
                    <p className="text-xs text-slate-500">Due: {brief.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      {brief.filedStatus}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {brief.wordCount.toLocaleString()} words
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No briefs available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
