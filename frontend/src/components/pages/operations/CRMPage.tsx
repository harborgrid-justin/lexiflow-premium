/**
 * @module components/pages/CRMPage
 * @category Pages
 * @description Client relationship management page - contacts, clients, and leads
 */

import React from 'react';
import { CRMDashboard } from '@/features/operations/crm/CRMDashboard';
import { PageContainerLayout } from '@/components/layouts';

/**
 * CRMPage - React 18 optimized with React.memo
 */
export const CRMPage = React.memo(() => {
  return (
    <PageContainerLayout>
      <CRMDashboard />
    </PageContainerLayout>
  );
});
