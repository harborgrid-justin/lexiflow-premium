/**
 * Clause Detail Page - Server Component with Data Fetching
 * Dynamic route for individual clause view
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface ClauseDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for clauses detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of clauses IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.CLAUSES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch clauses list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: ClauseDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const clause = await apiFetch(API_ENDPOINTS.CLAUSES.DETAIL(id)) as any;
    return {
      title: `${clause.title || 'Clause'} | LexiFlow`,
      description: clause.description || 'Clause details',
    };
  } catch (error) {
    return { title: 'Clause Not Found' };
  }
}

export default async function ClauseDetailPage({ params }: ClauseDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let clause: any;
  try {
    clause = await apiFetch(API_ENDPOINTS.CLAUSES.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading clause...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{clause.title || clause.name}</h1>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Category:</span>
              <span className="ml-2 font-medium">{clause.category}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Clause Text</h2>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {clause.text || clause.content || 'No content available'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
