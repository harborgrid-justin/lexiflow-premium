/**
 * Matter Detail Page - Server Component with Data Fetching
 * Dynamic route for individual matter view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface MatterDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for matters detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of matters IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.MATTERS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch matters list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: MatterDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const matter: unknown = await apiFetch(API_ENDPOINTS.MATTERS.DETAIL(id));
    return {
      title: `Matter: ${matter.name} | LexiFlow`,
      description: matter.description || 'Matter details',
    };
  } catch {
    return { title: 'Matter Not Found' };
  }
}

export default async function MatterDetailPage({ params }: MatterDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let matter: any;
  try {
    matter = await apiFetch(API_ENDPOINTS.MATTERS.DETAIL(id));
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading matter...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{matter.name}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Matter #{matter.matterNumber}
              </p>
            </div>
            <span className="px-3 py-1 text-sm rounded bg-blue-100 dark:bg-blue-900">
              {matter.status}
            </span>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Client:</span>
                <span className="ml-2 font-medium">{matter.clientName}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
                <span className="ml-2">{matter.type}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Opened:</span>
                <span className="ml-2">{matter.openedDate}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Responsible Attorney:</span>
                <span className="ml-2">{matter.responsibleAttorney}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-slate-700 dark:text-slate-300">
                {matter.description || 'No description available'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t pt-4">
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <div className="text-2xl font-bold">{matter.caseCount || 0}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Cases</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <div className="text-2xl font-bold">{matter.documentCount || 0}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Documents</div>
              </div>
              <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                <div className="text-2xl font-bold">${matter.billedAmount || 0}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Billed</div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
