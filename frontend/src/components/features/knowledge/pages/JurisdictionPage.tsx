/**
 * @module components/pages/JurisdictionPage
 * @category Pages
 * @description Jurisdiction management page - court rules and local procedures
 */

import { JurisdictionManager } from '@/features/knowledge/jurisdiction/JurisdictionManager';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import React from "react";

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
