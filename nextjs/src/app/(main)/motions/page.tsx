/**
 * Motions List Page - Server Component with Data Fetching
 * List view of all motions
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Motions | LexiFlow',
  description: 'Manage motions and filings',
};

interface Motion {
  id: string;
  motionType: string;
  filingDate: string;
  court: string;
  status: string;
  hearingDate: string;
  caseNumber: string;
}

export default async function MotionsPage(): Promise<JSX.Element> {
  // Fetch motions from backend
  let motions: Motion[] = [];

  try {
    motions = await apiFetch(API_ENDPOINTS.MOTIONS.LIST);
  } catch (error) {
    console.error('Failed to load motions:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Motions</h1>
        <Link
          href="/motions/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          File Motion
        </Link>
      </div>

      <Suspense fallback={<div>Loading motions...</div>}>
        <div className="grid grid-cols-1 gap-4">
          {motions && motions.length > 0 ? (
            motions.map((motion) => (
              <Link
                key={motion.id}
                href={`/motions/${motion.id}`}
                className="block p-6 bg-white dark:bg-slate-800 rounded-lg border hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{motion.motionType}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Case: {motion.caseNumber}</p>
                    <p className="text-xs text-slate-500 mt-1">Court: {motion.court}</p>
                    <p className="text-xs text-slate-500">Filed: {motion.filingDate}</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {motion.status}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Hearing: {motion.hearingDate}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-slate-600 dark:text-slate-400">No motions available</p>
          )}
        </div>
      </Suspense>
    </div>
  );
}
