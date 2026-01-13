/**
 * @module components/pages/CorrespondencePage
 * @category Pages
 * @description Correspondence management page - email and communication tracking
 */

import { CorrespondenceManager } from '@/features/operations/correspondence/CorrespondenceManager';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

interface CorrespondencePageProps {
  caseId?: string;
}

/**
 * CorrespondencePage - React 18 optimized with React.memo
 */
export const CorrespondencePage = React.memo<CorrespondencePageProps>(({ caseId: _caseId }) => {
  return (
    <PageContainerLayout>
      <CorrespondenceManager />
    </PageContainerLayout>
  );
});
