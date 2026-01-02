/**
 * Documents Page - Server Component with Data Fetching
 * Fetches initial document list from backend
 */
import React from 'react';
import { DocumentManager } from '@/components/documents/DocumentManager';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Documents',
  description: 'Manage legal documents',
};

export default async function DocumentsPage(): Promise<React.JSX.Element> {
  // Fetch initial documents and folders from backend
  let documents = [];
  let folders = [];

  try {
    const [docsData, foldersData] = await Promise.all([
      apiFetch(API_ENDPOINTS.DOCUMENTS.LIST).catch(() => ({ data: [] })),
      apiFetch(API_ENDPOINTS.DOCUMENTS.FOLDERS).catch(() => []),
    ]);
    documents = docsData?.data || [];
    folders = foldersData || [];
  } catch (error) {
    console.error('Failed to load documents:', error);
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<div className="p-8">Loading documents...</div>}>
        <DocumentManager initialDocuments={documents} initialFolders={folders} />
      </Suspense>
    </div>
  );
}
