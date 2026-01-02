/**
 * Motion Detail Page - Server Component with Data Fetching
 * Dynamic route for individual motion view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface MotionDetailPageProps {
  params: Promise<{ id: string }>;
}

interface MotionDetail {
  id: string;
  motionType: string;
  filingDate: string;
  court: string;
  status: string;
  hearingDate: string;
  caseNumber: string;
  motionText: string;
  supportingEvidence: string[];
  opposition: string | null;
  ruling: string | null;
  attorney: string;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for motions detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of motions IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.MOTIONS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch motions list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: MotionDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const motion = await apiFetch(API_ENDPOINTS.MOTIONS.DETAIL(id)) as MotionDetail;
    return {
      title: `${motion.motionType} | LexiFlow`,
      description: `Motion in case ${motion.caseNumber}`,
    };
  } catch (error) {
    return { title: 'Motion Not Found' };
  }
}

export default async function MotionDetailPage({ params }: MotionDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let motion: MotionDetail;
  try {
    motion = await apiFetch(API_ENDPOINTS.MOTIONS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading motion...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{motion.motionType}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Case: {motion.caseNumber}</p>
              <p className="text-slate-600 dark:text-slate-400">Attorney: {motion.attorney}</p>
            </div>
            <div className="text-right">
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {motion.status}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Court: {motion.court}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 mb-6">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Filing Date:</span>
              <span className="ml-2">{motion.filingDate}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Hearing Date:</span>
              <span className="ml-2">{motion.hearingDate}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Motion Text</h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded">
                <p className="whitespace-pre-wrap">{motion.motionText}</p>
              </div>
            </div>

            {motion.supportingEvidence && motion.supportingEvidence.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Supporting Evidence</h2>
                <ul className="list-disc list-inside space-y-1">
                  {motion.supportingEvidence.map((evidence, index) => (
                    <li key={index} className="text-slate-700 dark:text-slate-300">{evidence}</li>
                  ))}
                </ul>
              </div>
            )}

            {motion.opposition && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Opposition</h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded">
                  <p className="whitespace-pre-wrap">{motion.opposition}</p>
                </div>
              </div>
            )}

            {motion.ruling && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Ruling</h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded">
                  <p className="whitespace-pre-wrap">{motion.ruling}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Withdraw Motion
            </button>
            <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
              File Opposition
            </button>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
