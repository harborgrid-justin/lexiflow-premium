/**
 * @module components/pages/CaseAnalyticsPage
 * @category Pages
 * @description Case analytics and reporting page - data-driven case insights
 */

import React from 'react';
import { CaseAnalyticsDashboard } from '@/features/cases/components/analytics/CaseAnalyticsDashboard';
import { PageContainerLayout } from '@/components/ui/layouts/PageContainerLayout/PageContainerLayout';

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
