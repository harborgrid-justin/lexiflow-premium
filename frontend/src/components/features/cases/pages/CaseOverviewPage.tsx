/**
 * @module components/pages/CaseOverviewPage
 * @category Pages
 * @description Case overview dashboard page - comprehensive case insights and status
 */

import React from 'react';
import { CaseOverviewDashboard } from '@/features/cases/components/overview/CaseOverviewDashboard';
import { PageContainerLayout } from '@/components/ui/layouts/PageContainerLayout/PageContainerLayout';

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
