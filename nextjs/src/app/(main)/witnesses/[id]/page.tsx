/**
 * Witness Detail Page - Server Component with Data Fetching
 * Dynamic route for individual witness view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface WitnessDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 1800; // Revalidate every 30 minutes

/**
 * Generate static params for witnesses detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of witnesses IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.WITNESSES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch witnesses list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: WitnessDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const witness: unknown = await apiFetch(API_ENDPOINTS.WITNESSES.DETAIL(id));
    return {
      title: `Witness: ${witness.name} | LexiFlow`,
      description: `Witness profile for ${witness.name}`,
    };
  } catch (error) {
    return { title: 'Witness Not Found' };
  }
}

export default async function WitnessDetailPage({ params }: WitnessDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let witness: any;
  try {
    witness = await apiFetch(API_ENDPOINTS.WITNESSES.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading witness...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{witness.name}</h1>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
              <span className="ml-2 font-medium">{witness.type}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Contact:</span>
              <span className="ml-2">{witness.email || witness.phone}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Background</h2>
              <p className="text-slate-700 dark:text-slate-300">{witness.background}</p>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Testimony Summary</h2>
              <p className="text-slate-700 dark:text-slate-300">{witness.testimonySummary}</p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
