import { DocumentManager } from '@/features/operations/documents/DocumentManager';
import { createListMeta } from '../_shared/meta-utils';
import type { Route } from "./+types/index";

export function meta({ data }: Route.MetaArgs) {
  return createListMeta({
    entityType: 'Documents',
    count: 0, // TODO: Get actual count from loader if needed
    description: 'Manage your legal documents, filings, and attachments',
  });
}

export default function DocumentsIndexRoute() {
  return <DocumentManager />;
}
