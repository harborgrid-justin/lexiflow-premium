/**
 * Organizations Detail Page - Server Component with Data Fetching
 * Dynamic route for individual organization view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface OrganizationDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for organizations detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of organizations IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.ORGANIZATIONS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch organizations list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({
  params,
}: OrganizationDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const org: unknown = await apiFetch(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id));
    return {
      title: `${org.name} | LexiFlow`,
      description: `Organization profile for ${org.name}`,
    };
  } catch (error) {
    return { title: 'Organization Not Found' };
  }
}

export default async function OrganizationDetailPage({ params }: OrganizationDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let org: any;
  try {
    org = await apiFetch(API_ENDPOINTS.ORGANIZATIONS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading organization...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{org.name}</h1>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Type:</span>
              <span className="ml-2 font-medium">{org.type}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Industry:</span>
              <span className="ml-2">{org.industry}</span>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
              <p className="text-slate-700 dark:text-slate-300">{org.address}</p>
              <p className="text-slate-700 dark:text-slate-300">{org.phone}</p>
              <p className="text-slate-700 dark:text-slate-300">{org.email}</p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
