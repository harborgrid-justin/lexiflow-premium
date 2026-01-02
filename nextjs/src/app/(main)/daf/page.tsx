/**
 * DAF Page - Server Component with Data Fetching
 * Data Access Framework dashboard
 */
import DafDashboard from '@/components/daf/DafDashboard';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'DAF | LexiFlow',
  description: 'Data Access Framework',
};

export default async function DafPage(): Promise<JSX.Element> {
  // Fetch sync status and data sources
  let syncStatus = null;

  try {
    syncStatus = await apiFetch(API_ENDPOINTS.SYNC.STATUS);
  } catch (error) {
    console.error('Failed to load DAF status:', error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading DAF...</div>}>
        <DafDashboard initialSyncStatus={syncStatus} />
      </Suspense>
    </div>
  );
}
