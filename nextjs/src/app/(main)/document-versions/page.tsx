/**
 * Document Versions Page - Server Component with Data Fetching
 * Displays document version history and management
 */
import { DocumentVersionsList } from '@/components/document-versions/DocumentVersionsList';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Document Versions',
  description: 'Manage document version history',
};

export default async function DocumentVersionsPage() {
  // Fetch initial document versions from backend
  let versions = [];

  try {
    const data = await apiFetch(API_ENDPOINTS.DOCUMENT_VERSIONS.ALL).catch(() => ({ data: [] }));
    versions = data?.data || [];
  } catch (error) {
    console.error('Failed to load document versions:', error);
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<div className="p-8">Loading document versions...</div>}>
        <DocumentVersionsList initialVersions={versions} />
      </Suspense>
    </div>
  );
}
