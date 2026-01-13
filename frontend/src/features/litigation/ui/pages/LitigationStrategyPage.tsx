/**
 * @module components/pages/LitigationStrategyPage
 * @category Pages
 * @description Litigation strategy canvas page - visual strategy planning and execution
 */

import { LitigationBuilder } from '@/features/litigation/strategy/LitigationBuilder';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

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
