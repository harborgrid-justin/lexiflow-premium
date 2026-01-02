/**
 * Citation Detail Page - Server Component with Data Fetching
 * Dynamic route for individual citation view
 */
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface CitationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CitationDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const citation = await apiFetch(API_ENDPOINTS.CITATIONS.LIST + `/${id}`);
    return {
      title: `${citation.title || 'Citation'} | LexiFlow`,
      description: citation.citation || 'Citation details',
    };
  } catch (error) {
    return { title: 'Citation Not Found' };
  }
}

export default async function CitationDetailPage({ params }: CitationDetailPageProps) {
  const { id } = await params;

  let citation;
  try {
    citation = await apiFetch(API_ENDPOINTS.CITATIONS.LIST + `/${id}`);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading citation...</div>}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">{citation.citation}</h1>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Case Name:</span>
              <span className="ml-2 font-medium">{citation.caseName}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Court:</span>
              <span className="ml-2">{citation.court}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Year:</span>
              <span className="ml-2">{citation.year}</span>
            </div>
            <div>
              <span className="text-sm text-slate-600 dark:text-slate-400">Reporter:</span>
              <span className="ml-2">{citation.reporter}</span>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}
