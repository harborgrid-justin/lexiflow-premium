/**
 * @module components/pages/CorrespondencePage
 * @category Pages
 * @description Correspondence management page - email and communication tracking
 */

import React from 'react';
import { CorrespondenceManager } from '@/features/operations/correspondence';
import { PageContainerLayout } from '@/components/layouts';

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
