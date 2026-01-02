/**
 * Docket Detail Page - Server Component with Data Fetching
 * Fetches specific docket entry from backend
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface DocketDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for docket detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of docket IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.DOCKET.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch docket list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: DocketDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const docket = await apiFetch(API_ENDPOINTS.DOCKET.DETAIL(id));
    return {
      title: `Docket ${docket.entryNumber || id} | LexiFlow`,
      description: docket.description || 'Docket entry details',
    };
  } catch {
    return { title: 'Docket Not Found' };
  }
}

export default async function DocketDetailPage({ params }: DocketDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let docket;
  try {
    docket = await apiFetch(API_ENDPOINTS.DOCKET.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Docket Entry: {docket.entryNumber || id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">{docket.description}</p>
        <div className="mt-4 text-sm text-slate-500">
          <p>Filed: {new Date(docket.filedDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
