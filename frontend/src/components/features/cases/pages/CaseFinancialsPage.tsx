/**
 * @module components/pages/CaseFinancialsPage
 * @category Pages
 * @description Case financial management page - budgets, billing, and cost tracking
 */

import React from 'react';
import { CaseFinancialsCenter } from '@/features/cases';
import { PageContainerLayout } from '@/components/layouts';

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
