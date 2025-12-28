/**
 * @module components/pages/JurisdictionPage
 * @category Pages
 * @description Jurisdiction management page - court rules and local procedures
 */

import React from 'react';
import { JurisdictionManager } from '@/features/knowledge/jurisdiction';
import { PageContainerLayout } from '@/components/layouts';

/**
 * JurisdictionPage - React 18 optimized with React.memo
 */
export const JurisdictionPage = React.memo(() => {
  return (
    <PageContainerLayout>
      <JurisdictionManager />
    </PageContainerLayout>
  );
});
