/**
 * Document Approvals Page - Server Component with Data Fetching
 * Displays document approval workflow and status tracking
 */
import { DocumentApprovalsList } from '@/components/document-approvals/DocumentApprovalsList';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { Suspense } from 'react';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: 'Document Approvals',
  description: 'Manage document approval workflows',
};

export default async function DocumentApprovalsPage(): Promise<JSX.Element> {
  // Fetch initial document approvals from backend
  let approvals = [];

  try {
    const data = await apiFetch(API_ENDPOINTS.DOCUMENT_APPROVALS.LIST).catch(() => ({ data: [] }));
    approvals = data?.data || [];
  } catch (error) {
    console.error('Failed to load document approvals:', error);
  }

  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={<div className="p-8">Loading document approvals...</div>}>
        <DocumentApprovalsList initialApprovals={approvals} />
      </Suspense>
    </div>
  );
}
