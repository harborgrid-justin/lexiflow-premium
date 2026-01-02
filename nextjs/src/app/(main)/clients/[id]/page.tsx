/**
 * Client Detail Page - Server Component with Data Fetching
 * Dynamic route for individual client view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 1800; // Revalidate every 30 minutes

/**
 * Generate static params for clients detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of clients IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.CLIENTS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch clients list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: ClientDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const client = await apiFetch(API_ENDPOINTS.CLIENTS.DETAIL(id)) as any;
    return {
      title: `${client.name || 'Client'} | LexiFlow`,
      description: `Client profile for ${client.name}`,
    };
  } catch (error) {
    return { title: 'Client Not Found' };
  }
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let client: any;
  try {
    client = await apiFetch(API_ENDPOINTS.CLIENTS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading client...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6">{client.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Contact Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Email:</span>
                  <span className="ml-2">{client.email}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Phone:</span>
                  <span className="ml-2">{client.phone}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Address:</span>
                  <span className="ml-2">{client.address}</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-3">Client Status</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                  <span className="ml-2 font-medium">{client.status}</span>
                </div>
                <div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Since:</span>
                  <span className="ml-2">{client.createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
