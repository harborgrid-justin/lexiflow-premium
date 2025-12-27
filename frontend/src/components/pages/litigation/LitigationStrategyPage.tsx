/**
 * @module components/pages/LitigationStrategyPage
 * @category Pages
 * @description Litigation strategy canvas page - visual strategy planning and execution
 */

import React from 'react';
import { LitigationBuilder } from '@/features/litigation';
import { PageContainerLayout } from '@/components/layouts';

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
