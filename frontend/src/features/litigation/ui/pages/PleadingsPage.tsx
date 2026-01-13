/**
 * @module components/pages/PleadingsPage
 * @category Pages
 * @description Pleadings management page - automated legal document drafting
 */

import { PleadingDashboard } from '@/features/litigation/pleadings/PleadingDashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import type { PleadingDocument } from '@/types';
import React from "react";

interface PleadingsPageProps {
  onCreate: (newDoc: PleadingDocument) => void;
  onEdit: (id: string) => void;
  caseId?: string;
}

/**
 * PleadingsPage - React 18 optimized with React.memo
 */
export const PleadingsPage = React.memo<PleadingsPageProps>(({
  onCreate,
  onEdit,
  caseId
}) => {
  return (
    <PageContainerLayout>
      <PleadingDashboard
        onCreate={onCreate}
        onEdit={onEdit}
        caseId={caseId}
      />
    </PageContainerLayout>
  );
});
