/**
 * @module components/pages/CaseFinancialsPage
 * @category Pages
 * @description Case financial management page - budgets, billing, and cost tracking
 */

import React from 'react';
import { CaseFinancialsCenter } from '@/features/cases/components/financials/CaseFinancialsCenter';
import { PageContainerLayout } from '@/components/ui/layouts/PageContainerLayout/PageContainerLayout';

interface CaseFinancialsPageProps {
  caseId: string;
}

/**
 * CaseFinancialsPage - React 18 optimized with React.memo
 */
export const CaseFinancialsPage = React.memo<CaseFinancialsPageProps>(({ caseId: _caseId }) => {
  return (
    <PageContainerLayout>
      <CaseFinancialsCenter />
    </PageContainerLayout>
  );
});
