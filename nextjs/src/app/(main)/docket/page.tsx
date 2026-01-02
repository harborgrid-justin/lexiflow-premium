/**
 * Docket Page - Server Component with Data Fetching
 * Fetches docket entries from backend
 */
import DocketManager from '@/components/docket/DocketManager';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Docket | LexiFlow',
  description: 'Manage court dockets and filings',
};

export default async function DocketPage(): Promise<JSX.Element> {
  // Fetch docket entries from backend
  let docketEntries = [];

  try {
    docketEntries = await apiFetch(API_ENDPOINTS.DOCKET.LIST);
  } catch (error) {
    console.error('Failed to load docket entries:', error);
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="p-8">Loading docket...</div>}>
        <DocketManager initialEntries={docketEntries} />
      </Suspense>
    </div>
  );
}
