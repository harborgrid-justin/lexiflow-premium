/**
 * Production Request Detail Page - Server Component with Data Fetching
 * Dynamic route for individual production request view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ProductionRequestDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for production-requests detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of production-requests IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.PRODUCTION_REQUESTS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch production-requests list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductionRequestDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const request: unknown = await apiFetch(API_ENDPOINTS.PRODUCTION_REQUESTS.DETAIL(id));
    return {
      title: `Production Request: ${request.title} | LexiFlow`,
      description: request.description || 'Production request details',
    };
  } catch (error) {
    return { title: 'Production Request Not Found' };
  }
}

export default async function ProductionRequestDetailPage({ params }: ProductionRequestDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let request: any;
  try {
    request = await apiFetch(API_ENDPOINTS.PRODUCTION_REQUESTS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading production request...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{request.title}</h1>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className="ml-2 font-medium">{request.status}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Requesting Party:</span>
                <span className="ml-2">{request.requestingParty}</span>
              </div>
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Compliance:</span>
                <span className="ml-2 font-semibold">{request.compliancePercentage || 0}%</span>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Parties</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Requesting Party:</span>
                  <div className="mt-1 text-slate-700 dark:text-slate-300">{request.requestingParty}</div>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Producing Party:</span>
                  <div className="mt-1 text-slate-700 dark:text-slate-300">{request.producingParty}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Requested Items</h2>
              <div className="space-y-3">
                {request.items?.map((item: any, index: number) => (
                  <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      Item {index + 1}: {item.category}
                    </div>
                    <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      {item.description}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Status: <span className="font-medium">{item.status}</span>
                      </span>
                      {item.objectionFiled && (
                        <span className="text-amber-600 dark:text-amber-400">
                          ⚠ Objection Filed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Bates Ranges</h2>
              <div className="bg-slate-50 dark:bg-slate-700 rounded p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {request.batesRanges?.map((range: any, index: number) => (
                    <div key={index} className="font-mono text-slate-700 dark:text-slate-300">
                      {range.start} - {range.end}
                    </div>
                  ))}
                </div>
                {(!request.batesRanges || request.batesRanges.length === 0) && (
                  <p className="text-slate-600 dark:text-slate-400">No bates ranges assigned</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Objections</h2>
              <div className="text-slate-700 dark:text-slate-300">
                {request.objections?.length || 0} objections filed
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
