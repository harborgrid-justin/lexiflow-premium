/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * @module components/pages/CaseFinancialsPage
 * @category Pages
 * @description Case financial management page - budgets, billing, and cost tracking
 */

import React from 'react';

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { CaseFinancialsCenter } from '@/routes/cases/components/financials/CaseFinancialsCenter';

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
