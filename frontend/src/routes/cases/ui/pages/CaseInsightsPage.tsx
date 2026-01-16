/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * @module components/pages/CaseInsightsPage
 * @category Pages
 * @description Strategic case insights page - AI-powered case analysis and recommendations
 */

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { CaseInsightsDashboard } from '@/routes/cases/components/insights/CaseInsightsDashboard';
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
