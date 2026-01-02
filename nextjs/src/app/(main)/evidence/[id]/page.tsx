/**
 * Evidence Detail Page - Server Component with Data Fetching
 * Fetches specific evidence item from backend
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface EvidenceDetailPageProps {
  params: Promise<{ id: string }>;
}


// Static Site Generation (SSG) Configuration
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every 60 minutes

/**
 * Generate static params for evidence detail pages
 *
 * Next.js 16 will pre-render these pages at build time.
 * With revalidate, pages are regenerated in the background when stale.
 *
 * @returns Array of { id: string } objects for static generation
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    // Fetch list of evidence IDs for static generation
    const response = await apiFetch<any[]>(
      API_ENDPOINTS.EVIDENCE.LIST + '?limit=100&fields=id'
    );

    // Map to the required { id: string } format
    return (response || []).map((item: any) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch evidence list:`, error);
    // Return empty array to continue build without static params
    // Pages will be generated on-demand (ISR) instead
    return [];
  }
}

export async function generateMetadata({ params }: EvidenceDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const evidence = await apiFetch(API_ENDPOINTS.EVIDENCE.DETAIL(id));
    return {
      title: `Evidence ${evidence.evidenceNumber || id} | LexiFlow`,
      description: evidence.description || 'Evidence details',
    };
  } catch {
    return { title: 'Evidence Not Found' };
  }
}

export default async function EvidenceDetailPage({ params }: EvidenceDetailPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let evidence;
  try {
    evidence = await apiFetch(API_ENDPOINTS.EVIDENCE.DETAIL(id));
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-6">
        Evidence: {evidence.evidenceNumber || id}
      </h1>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">{evidence.description}</p>
        <div className="mt-4 text-sm text-slate-500">
          <p>Chain of Custody: {evidence.chainOfCustody}</p>
        </div>
      </div>
    </div>
  );
}
