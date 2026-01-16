/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * @module components/pages/CaseOperationsPage
 * @category Pages
 * @description Case operations and task management page - operational view of case activities
 */

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { CaseOperationsCenter } from '@/routes/cases/components/operations/CaseOperationsCenter';
import React from 'react';

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
