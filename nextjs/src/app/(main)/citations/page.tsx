/**
 * Citations Page - Server Component with Data Fetching
 * Fetches citations library from backend
 */
import React from 'react';
import { CitationManager } from '@/components/citations/CitationManager';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Citation Manager',
  description: 'Manage legal citations and analyze briefs',
};

export default async function CitationsPage(): Promise<React.JSX.Element> {
  // Fetch citations from backend
  let citations = [];

  try {
    citations = await apiFetch(API_ENDPOINTS.CITATIONS.LIST);
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <Suspense fallback={<div className="p-8">Loading citations...</div>}>
      <CitationManager initialCitations={citations} />
    </Suspense>
  );
}
