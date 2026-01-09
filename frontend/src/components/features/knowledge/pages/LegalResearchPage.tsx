/**
 * @module components/pages/LegalResearchPage
 * @category Pages
 * @description Legal research page - AI-powered case law and statute research
 */

import React from 'react';
import { ResearchTool } from '@/features/knowledge/research/ResearchTool';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';

/**
 * LegalResearchPage - React 18 optimized with React.memo
 */
export const LegalResearchPage = React.memo(() => {
  return (
    <PageContainerLayout className="h-full p-0">
      <ResearchTool />
    </PageContainerLayout>
  );
});
