import { DocumentManager } from '@/features/operations/documents/DocumentManager';
import type { MetaArgs } from 'react-router';
import { createListMeta } from '../_shared/meta-utils';

export function meta(_args: MetaArgs) {
  return createListMeta({
    entityType: 'Documents',
    count: 0, // TODO: Get actual count from loader if needed
    description: 'Manage your legal documents, filings, and attachments',
  });
}

export default function DocumentsIndexRoute() {
  return <DocumentManager />;
}
