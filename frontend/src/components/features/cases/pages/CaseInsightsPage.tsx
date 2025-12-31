/**
 * @module components/pages/CaseInsightsPage
 * @category Pages
 * @description Strategic case insights page - AI-powered case analysis and recommendations
 */

import React from 'react';
import { CaseInsightsDashboard } from '@/features/cases/components/insights/CaseInsightsDashboard';
import { PageContainerLayout } from '@/components/ui/layouts/PageContainerLayout/PageContainerLayout';

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
