/**
 * @module components/pages/WorkflowPage
 * @category Pages
 * @description Workflow and automation page - process management and task automation
 */

import React from 'react';
import { MasterWorkflow } from '@/features/cases';
import { PageContainerLayout } from '@/components/layouts';

interface WorkflowPageProps {
  caseId?: string;
}

/**
 * WorkflowPage - React 18 optimized with React.memo
 */
export const WorkflowPage = React.memo<WorkflowPageProps>(() => {
  return (
    <PageContainerLayout>
      <MasterWorkflow onSelectCase={() => {}} />
    </PageContainerLayout>
  );
});
