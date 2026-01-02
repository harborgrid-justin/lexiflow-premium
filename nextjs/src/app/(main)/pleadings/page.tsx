/**
 * Pleadings Page - Server Component with Data Fetching
 * Fetches pleadings list from backend
 */
import { PleadingsView } from '@/components/pleadings';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Pleadings | LexiFlow',
  description: 'Manage and draft legal pleadings',
};

export default async function PleadingsPage() {
  // Fetch pleadings from backend
  let pleadings = [];

  try {
    pleadings = await apiFetch(API_ENDPOINTS.PLEADINGS.LIST);
  } catch (error) {
    console.error('Failed to load pleadings:', error);
  }

  return (
    <Suspense fallback={<div className="p-8">Loading pleadings...</div>}>
      <PleadingsView initialPleadings={pleadings} />
    </Suspense>
  );
}
