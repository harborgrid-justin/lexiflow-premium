/**
 * @module components/pages/LitigationStrategyPage
 * @category Pages
 * @description Litigation strategy canvas page - visual strategy planning and execution
 */

import React from "react";

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { LitigationBuilder } from '@/routes/litigation/components/strategy/LitigationBuilder';

interface LitigationStrategyPageProps {
  caseId: string;
}

/**
 * LitigationStrategyPage - React 18 optimized with React.memo
 */
export const LitigationStrategyPage = React.memo<LitigationStrategyPageProps>(({ caseId: _caseId }) => {
  return (
    <PageContainerLayout className="h-full p-0">
      <LitigationBuilder navigateToCaseTab={() => {}} />
    </PageContainerLayout>
  );
});
