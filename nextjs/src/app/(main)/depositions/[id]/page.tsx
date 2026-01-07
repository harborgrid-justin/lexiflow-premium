/**
 * Deposition Detail Page - Server Component with Data Fetching
 * Dynamic route for individual deposition view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface DepositionDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for depositions detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of depositions IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.DEPOSITIONS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch depositions list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: DepositionDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const depo = await apiFetch(API_ENDPOINTS.DEPOSITIONS.DETAIL(id)) as any;
    return {
      title: `Deposition: ${depo.deponentName} | LexiFlow`,
      description: `Deposition of ${depo.deponentName}`,
    };
  } catch (error) {
    return { title: 'Deposition Not Found' };
  }
}

export default async function DepositionDetailPage({ params }: DepositionDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let depo: any;
  try {
    depo = await apiFetch(API_ENDPOINTS.DEPOSITIONS.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading deposition...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Deposition: {depo.deponentName}</h1>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Date:</span>
                <span className="ml-2 font-medium">{depo.date}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className="ml-2 font-medium">{depo.status}</span>
              </div>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Location:</span>
              <span className="ml-2">{depo.location}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Transcript</h2>
              <div className="text-slate-700 dark:text-slate-300">
                {depo.transcriptUrl ? (
                  <a href={depo.transcriptUrl} className="text-blue-600 hover:underline">
                    View Transcript
                  </a>
                ) : (
                  'Transcript not available'
                )}
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
