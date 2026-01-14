/**
 * @module components/pages/CaseListPage
 * @category Pages
 * @description Case list and management page - standardized list view for case management
 */

import { CaseManagement } from '@/routes/cases/components/list/CaseManagement';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import React from 'react';

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
