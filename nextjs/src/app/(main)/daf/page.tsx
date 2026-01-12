/**
 * DAF Page - Server Component with Data Fetching
 * Data Access Framework dashboard
 */
import React from 'react';
import DafDashboard from '@/components/daf/DafDashboard';
import { API_ENDPOINTS } from '@/lib/api-config';
import { apiFetch } from '@/lib/api-server';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'DAF | LexiFlow',
  description: 'Data Access Framework',
};

export default async function DafPage(): Promise<React.JSX.Element> {
  // Fetch sync status and data sources
  let syncStatus = null;

  try {
    syncStatus = await apiFetch(API_ENDPOINTS.SYNC.STATUS);
  } catch (error) {    // Silent error handling (logging disabled to reduce console noise)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading DAF...</div>}>
        <DafDashboard initialSyncStatus={syncStatus} />
      </Suspense>
    </div>
  );
}
