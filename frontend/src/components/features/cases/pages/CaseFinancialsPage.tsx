/**
 * @module components/pages/CaseFinancialsPage
 * @category Pages
 * @description Case financial management page - budgets, billing, and cost tracking
 */

import { CaseFinancialsCenter } from '@/features/cases/components/financials/CaseFinancialsCenter';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import React from "react";

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
