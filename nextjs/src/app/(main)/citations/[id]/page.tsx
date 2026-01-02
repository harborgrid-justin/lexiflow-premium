/**
 * Citation Detail Page - Server Component with Data Fetching
 * Dynamic route for individual citation view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CitationDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for citations detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of citations IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.CITATIONS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch citations list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: CitationDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const citation = await apiFetch(API_ENDPOINTS.CITATIONS.LIST + `/${id}`);
    return {
      title: `${citation.title || 'Citation'} | LexiFlow`,
      description: citation.citation || 'Citation details',
    };
  } catch (error) {
    return { title: 'Citation Not Found' };
  }
}

export default async function CitationDetailPage({ params }: CitationDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let citation: any;
  try {
    citation = await apiFetch(API_ENDPOINTS.CITATIONS.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading citation...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{citation.citation}</h1>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Case Name:</span>
              <span className="ml-2 font-medium">{citation.caseName}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Court:</span>
              <span className="ml-2">{citation.court}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Year:</span>
              <span className="ml-2">{citation.year}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Reporter:</span>
              <span className="ml-2">{citation.reporter}</span>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
