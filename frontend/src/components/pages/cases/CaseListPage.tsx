/**
 * @module components/pages/CaseListPage
 * @category Pages
 * @description Case list and management page - standardized list view for case management
 */

import React from 'react';
import { CaseManagement } from '@/features/cases';
import { PageContainerLayout } from '@/components/layouts';

interface CaseListPageProps {
  onSelectCase?: (caseId: string) => void;
}

/**
 * CaseListPage - React 18 optimized with React.memo
 */
export const CaseListPage = React.memo<CaseListPageProps>(({ onSelectCase: _onSelectCase }) => {
  return (
    <PageContainerLayout>
      <CaseManagement />
    </PageContainerLayout>
  );
});
