import { DocumentManager } from '@/features/operations/documents/DocumentManager';
import { DataService } from '@/services/data/dataService';
import type { MetaArgs } from 'react-router';
import { createListMeta } from '../_shared/meta-utils';

export async function loader() {
  try {
    const documents = await DataService.documents.getAll();
    return { count: documents.length };
  } catch {
    return { count: 0 };
  }
}

export function meta({ data }: MetaArgs) {
  return createListMeta({
    entityType: 'Documents',
    count: (data as any)?.count || 0,
    description: 'Manage your legal documents, filings, and attachments',
  });
}

export default function DocumentsIndexRoute() {
  return <DocumentManager />;
}
