/**
 * Legal Hold Detail Page - Server Component with Data Fetching
 * Dynamic route for individual legal hold view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface LegalHoldDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for legal-holds detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of legal-holds IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.LEGAL_HOLDS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch legal-holds list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: LegalHoldDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const hold = await apiFetch(API_ENDPOINTS.LEGAL_HOLDS.DETAIL(id)) as any;
    return {
      title: `Legal Hold: ${hold.name} | LexiFlow`,
      description: hold.description || 'Legal hold details',
    };
  } catch (error) {
    return { title: 'Legal Hold Not Found' };
  }
}

export default async function LegalHoldDetailPage({ params }: LegalHoldDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let hold: any;
  try {
    hold = await apiFetch(API_ENDPOINTS.LEGAL_HOLDS.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading legal hold...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{hold.name}</h1>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className="ml-2 font-medium">{hold.status}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Issued:</span>
                <span className="ml-2">{hold.issuedDate}</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Scope</h2>
              <p className="text-slate-700 dark:text-slate-300">{hold.description}</p>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Custodians</h2>
              <div className="text-slate-700 dark:text-slate-300">
                {hold.custodians?.length || 0} custodians
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
