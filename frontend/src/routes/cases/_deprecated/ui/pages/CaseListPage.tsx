/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * @module components/pages/CaseListPage
 * @category Pages
 * @description Case list and management page - standardized list view for case management
 */

import React from 'react';

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';

import { CaseManagement } from '@/routes/cases/components/list/CaseManagement';

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
