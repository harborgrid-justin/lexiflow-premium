/**
 * @module components/pages/DocumentsPage
 * @category Pages
 * @description Document management page - enterprise document repository
 */

import React from 'react';
import { DocumentManager } from '@/features/operations/documents';
import { PageContainerLayout } from '@/components/layouts';

interface DocumentsPageProps {
  caseId?: string;
}

/**
 * DocumentsPage - React 18 optimized with React.memo
 */
export const DocumentsPage = React.memo<DocumentsPageProps>(({ caseId: _caseId }) => {
  return (
    <PageContainerLayout>
      <DocumentManager />
    </PageContainerLayout>
  );
});
