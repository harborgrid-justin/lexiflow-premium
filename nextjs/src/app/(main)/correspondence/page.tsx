/**
 * Correspondence Page - Server Component with Data Fetching
 * Manage legal correspondence and letters
 */
import CorrespondenceManager from '@/components/correspondence/CorrespondenceManager';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Correspondence | LexiFlow',
  description: 'Manage legal correspondence',
};

export default async function CorrespondencePage() {
  // Fetch correspondence from backend
  let correspondence = [];

  try {
    correspondence = await apiFetch(API_ENDPOINTS.CORRESPONDENCE.LIST);
  } catch (error) {
    console.error('Failed to load correspondence:', error);
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={<div className="p-8">Loading correspondence...</div>}>
        <CorrespondenceManager initialCorrespondence={correspondence} />
      </Suspense>
    </div>
  );
}
