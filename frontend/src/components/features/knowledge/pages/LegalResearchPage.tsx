/**
 * @module components/pages/LegalResearchPage
 * @category Pages
 * @description Legal research page - AI-powered case law and statute research
 */

import { ResearchTool } from '@/routes/research/components/ResearchTool';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import React from "react";

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
