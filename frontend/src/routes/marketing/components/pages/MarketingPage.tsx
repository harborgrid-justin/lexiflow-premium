/**
 * @module components/pages/MarketingPage
 * @category Pages
 * @description Marketing and business development page - client acquisition and tracking
 */

import React from 'react';

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { MarketingDashboard } from '@/routes/practice/components/MarketingDashboard';

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
