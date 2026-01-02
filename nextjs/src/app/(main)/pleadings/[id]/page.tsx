/**
 * Pleading Detail Page - Server Component with Data Fetching
 * Dynamic route for individual pleading view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface PleadingDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for pleadings detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of pleadings IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.PLEADINGS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch pleadings list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: PleadingDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const pleading = await apiFetch(API_ENDPOINTS.PLEADINGS.DETAIL(id));
    return {
      title: `${pleading.title || 'Pleading'} | LexiFlow`,
      description: pleading.description || 'Pleading details',
    };
  } catch (error) {
    return { title: 'Pleading Not Found' };
  }
}

export default async function PleadingDetailPage({ params }: PleadingDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let pleading;
  try {
    pleading = await apiFetch(API_ENDPOINTS.PLEADINGS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading pleading...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{pleading.title}</h1>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
              <span className="ml-2 font-medium">{pleading.type}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
              <span className="ml-2 font-medium">{pleading.status}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Filed Date:</span>
              <span className="ml-2">{pleading.filedDate}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">Content</h2>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {pleading.content || 'No content available'}
              </p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
