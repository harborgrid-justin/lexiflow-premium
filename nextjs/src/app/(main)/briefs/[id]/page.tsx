/**
 * Brief Detail Page - Server Component with Data Fetching
 * Dynamic route for individual brief view
 */
import React from 'react';
import { apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface BriefDetailPageProps {
  params: Promise<{ id: string }>;
}

interface BriefDetail {
  id: string;
  briefType: string;
  dueDate: string;
  wordCount: number;
  filedStatus: string;
  caseNumber: string;
  author: string;
  content: string;
  citations: string[];
  exhibits: string[];
  filingReceipt: string | null;
  filedDate: string | null;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for briefs detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of briefs IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.BRIEFS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch briefs list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: BriefDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const brief = await apiFetch(`/briefs/${id}`) as BriefDetail;
    return {
      title: `${brief.briefType} | LexiFlow`,
      description: `Brief for case ${brief.caseNumber}`,
    };
  } catch (error) {
    return { title: 'Brief Not Found' };
  }
}

export default async function BriefDetailPage({ params }: BriefDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let brief: BriefDetail;
  try {
    brief = await apiFetch(`/briefs/${id}`);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading brief...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{brief.briefType}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Case: {brief.caseNumber}</p>
              <p className="text-slate-600 dark:text-slate-400">Author: {brief.author}</p>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-2 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                {brief.filedStatus}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {brief.wordCount.toLocaleString()} words
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 mb-6">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Due Date:</span>
              <span className="ml-2">{brief.dueDate}</span>
            </div>
            {brief.filedDate && (
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Filed Date:</span>
                <span className="ml-2">{brief.filedDate}</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Brief Content</h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded max-h-96 overflow-y-auto">
                <p className="whitespace-pre-wrap">{brief.content}</p>
              </div>
            </div>

            {brief.citations && brief.citations.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Citations</h2>
                <ul className="list-disc list-inside space-y-1">
                  {brief.citations.map((citation, index) => (
                    <li key={index} className="text-slate-700 dark:text-slate-300">{citation}</li>
                  ))}
                </ul>
              </div>
            )}

            {brief.exhibits && brief.exhibits.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Exhibits</h2>
                <div className="grid grid-cols-2 gap-2">
                  {brief.exhibits.map((exhibit, index) => (
                    <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900 rounded">
                      {exhibit}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {brief.filingReceipt && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Filing Receipt</h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded">
                  <p className="font-mono text-sm">{brief.filingReceipt}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              File Brief
            </button>
            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
              Export PDF
            </button>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
