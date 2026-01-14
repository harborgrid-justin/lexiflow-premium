import { DocumentManager } from '@/features/operations/documents/DocumentManager';
import { documentsApi } from '@/lib/frontend-api';
import type { MetaArgs } from 'react-router';
import { createListMeta } from '../_shared/meta-utils';

interface LoaderData {
  count: number;
}

export async function loader(): Promise<LoaderData> {
  try {
    // Fetch documents using new enterprise API with pagination
    const result = await documentsApi.getAllDocuments({ page: 1, limit: 1000 });
    const count = result.ok ? result.data.total : 0;
    return { count };
  } catch {
    return { count: 0 };
  }
}

export function meta({ data }: MetaArgs) {
  const loaderData = data as LoaderData | undefined;
  return createListMeta({
    entityType: 'Documents',
    count: loaderData?.count || 0,
    description: 'Manage your legal documents, filings, and attachments',
  });
}

export default function DocumentsIndexRoute() {
  return <DocumentManager />;
}
