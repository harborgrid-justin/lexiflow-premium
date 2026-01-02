/**
 * Document Detail Page - Server Component with Data Fetching
 * Fetches specific document from backend
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 600; // Revalidate every 10 minutes

/**
 * Generate static params for documents detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of documents IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.DOCUMENTS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch documents list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: DocumentDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const document = await apiFetch(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
    return {
      title: `${document.title || document.filename} | LexiFlow`,
      description: document.description || 'Document details',
    };
  } catch {
    return { title: 'Document Not Found' };
  }
}

export default async function DocumentDetailPage({ params }: DocumentDetailPageProps): Promise<JSX.Element> {
  const { id } = await params;

  let document;
  try {
    document = await apiFetch(API_ENDPOINTS.DOCUMENTS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        {document.title || document.filename}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">{document.description}</p>
        <div className="mt-4 text-sm text-slate-500">
          <p>Type: {document.mimeType}</p>
          <p>Size: {(document.size / 1024).toFixed(2)} KB</p>
        </div>
      </div>
    </div>
  );
}
