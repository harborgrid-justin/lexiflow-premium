/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * @module components/pages/CaseOverviewPage
 * @category Pages
 * @description Case overview dashboard page - comprehensive case insights and status
 */

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { CaseOverviewDashboard } from '@/routes/cases/components/overview/CaseOverviewDashboard';
import React from 'react';

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
