/**
 * @module components/pages/DraftingPage
 * @category Pages
 * @description Document drafting page - AI-powered legal document generation
 */

import DraftingDashboard from '@/features/drafting/DraftingDashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

/**
 * DraftingPage - React 18 optimized with React.memo
 */
export const DraftingPage = React.memo(() => {
  return (
    <PageContainerLayout className="h-full p-0">
      <DraftingDashboard />
    </PageContainerLayout>
  );
});
