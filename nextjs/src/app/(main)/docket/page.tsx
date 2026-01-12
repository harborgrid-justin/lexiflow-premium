/**
 * Docket Page - Server Component with Data Fetching
 * Fetches docket entries from backend
 */
import React from 'react';
import DocketManager from '@/components/docket/DocketManager';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Docket | LexiFlow',
  description: 'Manage court dockets and filings',
};

export default async function DocketPage(): Promise<React.JSX.Element> {
  // Fetch docket entries from backend
  let docketEntries = [];

  try {
    docketEntries = await apiFetch(API_ENDPOINTS.DOCKET.LIST);
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="p-8">Loading docket...</div>}>
        <DocketManager initialEntries={docketEntries} />
      </Suspense>
    </div>
  );
}
