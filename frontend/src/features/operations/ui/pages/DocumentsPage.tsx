/**
 * @module components/pages/DocumentsPage
 * @category Pages
 * @description Document management page - enterprise document repository
 */

import { DocumentManager } from '@/features/operations/documents/DocumentManager';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

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
