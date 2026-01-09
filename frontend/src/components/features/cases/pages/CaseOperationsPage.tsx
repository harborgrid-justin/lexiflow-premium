/**
 * @module components/pages/CaseOperationsPage
 * @category Pages
 * @description Case operations and task management page - operational view of case activities
 */

import React from 'react';
import { CaseOperationsCenter } from '@/features/cases/components/operations/CaseOperationsCenter';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

interface CaseOperationsPageProps {
  caseId: string;
}

/**
 * CaseOperationsPage - React 18 optimized with React.memo
 */
export const CaseOperationsPage = React.memo<CaseOperationsPageProps>(({ caseId: _caseId }) => {
  return (
    <PageContainerLayout>
      <CaseOperationsCenter />
    </PageContainerLayout>
  );
});
