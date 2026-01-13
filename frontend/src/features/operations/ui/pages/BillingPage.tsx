/**
 * @module components/pages/BillingPage
 * @category Pages
 * @description Billing and invoicing page - comprehensive financial management
 */

import BillingDashboard from '@/features/operations/billing/BillingDashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

interface BillingPageProps {
  navigateTo?: (view: string) => void;
  initialTab?: string;
}

/**
 * BillingPage - React 18 optimized with React.memo
 */
export const BillingPage = React.memo<BillingPageProps>(({ 
  navigateTo, 
  initialTab 
}) => {
  return (
    <PageContainerLayout>
      <BillingDashboard 
        navigateTo={navigateTo}
        initialTab={initialTab}
      />
    </PageContainerLayout>
  );
});
