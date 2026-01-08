/**
 * Jurisdiction Detail Page - Server Component with Data Fetching
 * Dynamic route for individual jurisdiction view
 */
import React from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { Jurisdiction } from '../../../../types';


interface JurisdictionDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for jurisdictions detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of jurisdictions IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.JURISDICTIONS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch jurisdictions list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: JurisdictionDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const jurisdiction = (await apiFetch(API_ENDPOINTS.JURISDICTIONS.DETAIL(id))) as Jurisdiction;
    return {
      title: `${jurisdiction.name} | LexiFlow`,
      description: `Jurisdiction details for ${jurisdiction.name}`,
    };
  } catch (error) {
    return { title: 'Jurisdiction Not Found' };
  }
}

export default async function JurisdictionDetailPage({ params }: JurisdictionDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let jurisdiction: Jurisdiction;
  try {
    jurisdiction = (await apiFetch(API_ENDPOINTS.JURISDICTIONS.DETAIL(id))) as Jurisdiction;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading jurisdiction...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6">{jurisdiction.name}</h1>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
                <span className="ml-2 font-medium">{jurisdiction.type}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Level:</span>
                <span className="ml-2 font-medium">{jurisdiction.level}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">State:</span>
                <span className="ml-2">{jurisdiction.state}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">County:</span>
                <span className="ml-2">{jurisdiction.county || 'N/A'}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-3">Court Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Court Name:</span>
                  <span className="ml-2">{jurisdiction.courtName}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Address:</span>
                  <span className="ml-2">{jurisdiction.address}</span>
                </div>
                {jurisdiction.phone && (
                  <div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Phone:</span>
                    <span className="ml-2">{jurisdiction.phone}</span>
                  </div>
                )}
                {jurisdiction.website && (
                  <div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">Website:</span>
                    <a href={jurisdiction.website} className="ml-2 text-blue-600 hover:underline">
                      {jurisdiction.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {jurisdiction.rules && (
              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-3">Court Rules</h2>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {jurisdiction.rules}
                  </p>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-3">Statistics</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <div className="text-2xl font-bold">{jurisdiction.caseCount || 0}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Active Cases</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <div className="text-2xl font-bold">{jurisdiction.judgeCount || 0}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Judges</div>
                </div>
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-700 rounded">
                  <div className="text-2xl font-bold">{jurisdiction.filingFee ? `$${jurisdiction.filingFee}` : 'N/A'}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Filing Fee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
