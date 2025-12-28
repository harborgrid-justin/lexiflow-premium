/**
 * @module components/pages/CaseOverviewPage
 * @category Pages
 * @description Case overview dashboard page - comprehensive case insights and status
 */

import React from 'react';
import { CaseOverviewDashboard } from '@/features/cases';
import { PageContainerLayout } from '@/components/layouts';

interface CaseOverviewPageProps {
  caseId?: string;
}

/**
 * CaseOverviewPage - React 18 optimized with React.memo
 */
export const CaseOverviewPage = React.memo<CaseOverviewPageProps>(({ caseId: _caseId }) => {
  return (
    <PageContainerLayout>
      <CaseOverviewDashboard />
    </PageContainerLayout>
  );
});
