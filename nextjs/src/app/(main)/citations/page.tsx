/**
 * Citations Page - Server Component with Data Fetching
 * Fetches citations library from backend
 */
import { CitationManager } from '@/components/citations/CitationManager';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Citation Manager',
  description: 'Manage legal citations and analyze briefs',
};

export default async function CitationsPage() {
  // Fetch citations from backend
  let citations = [];

  try {
    citations = await apiFetch(API_ENDPOINTS.CITATIONS.LIST);
  } catch (error) {
    console.error('Failed to load citations:', error);
  }

  return (
    <Suspense fallback={<div className="p-8">Loading citations...</div>}>
      <CitationManager initialCitations={citations} />
    </Suspense>
  );
}
