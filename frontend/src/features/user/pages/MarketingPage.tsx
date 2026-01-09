/**
 * @module components/pages/MarketingPage
 * @category Pages
 * @description Marketing and business development page - client acquisition and tracking
 */

import React from 'react';
import { MarketingDashboard } from '@/features/knowledge/practice/MarketingDashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

/**
 * MarketingPage - React 18 optimized with React.memo
 */
export const MarketingPage = React.memo(() => {
  return (
    <PageContainerLayout>
      <MarketingDashboard />
    </PageContainerLayout>
  );
});
