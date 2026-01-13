/**
 * @module components/pages/CompliancePage
 * @category Pages
 * @description Compliance monitoring page - conflict checks and ethics management
 */

import { ComplianceDashboard } from '@/features/operations/compliance/ComplianceDashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

type ComplianceView = 'overview' | 'conflicts' | 'walls' | 'policies';

interface CompliancePageProps {
  initialTab?: ComplianceView;
}

/**
 * CompliancePage - React 18 optimized with React.memo
 */
export const CompliancePage = React.memo<CompliancePageProps>(({ initialTab }) => {
  return (
    <PageContainerLayout>
      <ComplianceDashboard initialTab={initialTab} />
    </PageContainerLayout>
  );
});
