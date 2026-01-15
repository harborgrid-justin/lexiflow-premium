/**
 * @module components/pages/CaseInsightsPage
 * @category Pages
 * @description Strategic case insights page - AI-powered case analysis and recommendations
 */

import { CaseInsightsDashboard } from '@/routes/cases/components/insights/CaseInsightsDashboard';
import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import React from 'react';

interface CaseInsightsPageProps {
  caseId: string;
}

/**
 * CaseInsightsPage - React 18 optimized with React.memo
 */
export const CaseInsightsPage = React.memo<CaseInsightsPageProps>(({ caseId: _caseId }) => {
  return (
    <PageContainerLayout>
      <CaseInsightsDashboard />
    </PageContainerLayout>
  );
});
