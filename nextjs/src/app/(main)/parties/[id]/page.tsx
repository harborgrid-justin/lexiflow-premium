/**
 * Party Detail Page - Server Component with Data Fetching
 * Dynamic route for individual party/entity view
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';


interface PartyDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for parties detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of parties IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.PARTIES.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch parties list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: PartyDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const party = await apiFetch(API_ENDPOINTS.PARTIES.DETAIL(id));
    return {
      title: `${party.name || 'Party'} | LexiFlow`,
      description: `Party information for ${party.name}`,
    };
  } catch (error) {
    return { title: 'Party Not Found' };
  }
}

export default async function PartyDetailPage({ params }: PartyDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let party;
  try {
    party = await apiFetch(API_ENDPOINTS.PARTIES.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading party...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{party.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Party Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
                  <span className="ml-2 font-medium">{party.type}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Role:</span>
                  <span className="ml-2">{party.role}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Email:</span>
                  <span className="ml-2">{party.email || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">Address</h2>
              <p className="text-slate-700 dark:text-slate-300">
                {party.address || 'No address on file'}
              </p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
