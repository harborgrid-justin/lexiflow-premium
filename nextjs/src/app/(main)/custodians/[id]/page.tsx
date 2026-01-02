/**
 * Custodian Detail Page - Server Component with Data Fetching
 * Dynamic route for individual custodian view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface CustodianDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for custodians detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of custodians IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.CUSTODIANS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch custodians list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: CustodianDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const custodian = await apiFetch(API_ENDPOINTS.CUSTODIANS.DETAIL(id)) as any;
    return {
      title: `Custodian: ${custodian.name} | LexiFlow`,
      description: `Custodian profile for ${custodian.name}`,
    };
  } catch (error) {
    return { title: 'Custodian Not Found' };
  }
}

export default async function CustodianDetailPage({ params }: CustodianDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let custodian: any;
  try {
    custodian = await apiFetch(API_ENDPOINTS.CUSTODIANS.DETAIL(id)) as any;
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading custodian...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{custodian.name}</h1>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Email:</span>
              <span className="ml-2">{custodian.email}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Department:</span>
              <span className="ml-2">{custodian.department}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
              <span className="ml-2 font-medium">{custodian.status}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Legal Holds</h2>
              <div className="text-slate-700 dark:text-slate-300">
                {custodian.legalHolds?.length || 0} active legal holds
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
