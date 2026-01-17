/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * @module components/pages/CaseAnalyticsPage
 * @category Pages
 * @description Case analytics and reporting page - data-driven case insights
 */

import React from 'react';

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { CaseAnalyticsDashboard } from '@/routes/cases/components/analytics/CaseAnalyticsDashboard';

interface CaseAnalyticsPageProps {
  caseId?: string;
}

/**
 * CaseAnalyticsPage - React 18 optimized with React.memo
 */
export const CaseAnalyticsPage = React.memo<CaseAnalyticsPageProps>(({ caseId: _caseId }) => {
  return (
    <PageContainerLayout>
      <CaseAnalyticsDashboard />
    </PageContainerLayout>
  );
});
