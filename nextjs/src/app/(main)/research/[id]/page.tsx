/**
 * Research Detail Page - Server Component
 * Research session detail view
 */
import React from 'react';
import { Metadata } from 'next';


interface ResearchDetailPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Research Session | LexiFlow',
  description: 'View research session details',
};


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for research detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of research IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.RESEARCH.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch research list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export default async function ResearchDetailPage({ params }: ResearchDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Research Session: {id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">Research session details coming soon.</p>
      </div>
    </div>
  );
}
