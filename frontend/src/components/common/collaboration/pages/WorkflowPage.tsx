/**
 * @module components/pages/WorkflowPage
 * @category Pages
 * @description Workflow and automation page - process management and task automation
 */

import React from 'react';

import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { MasterWorkflow } from '@/routes/cases/components/workflow/MasterWorkflow';

interface WorkflowPageProps {
  caseId?: string;
}

/**
 * WorkflowPage - React 18 optimized with React.memo
 */
export const WorkflowPage = React.memo<WorkflowPageProps>(function WorkflowPage() {
  return (
    <PageContainerLayout>
      <MasterWorkflow onSelectCase={() => { }} />
    </PageContainerLayout>
  );
});
