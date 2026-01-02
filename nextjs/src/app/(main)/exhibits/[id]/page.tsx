/**
 * Exhibit Detail Page - Server Component with Data Fetching
 * Fetches specific exhibit from backend
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';


interface ExhibitDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for exhibits detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of exhibits IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.EXHIBITS.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch exhibits list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: ExhibitDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const exhibit = await apiFetch(API_ENDPOINTS.EXHIBITS.DETAIL(id));
    return {
      title: `Exhibit ${exhibit.exhibitNumber || id} | LexiFlow`,
      description: exhibit.description || 'Exhibit details',
    };
  } catch {
    return { title: 'Exhibit Not Found' };
  }
}

export default async function ExhibitDetailPage({ params }: ExhibitDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let exhibit;
  try {
    exhibit = await apiFetch(API_ENDPOINTS.EXHIBITS.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Exhibit: {exhibit.exhibitNumber || id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">{exhibit.description}</p>
        <div className="mt-4 text-sm text-slate-500">
          <p>Type: {exhibit.type}</p>
        </div>
      </div>
    </div>
  );
}
