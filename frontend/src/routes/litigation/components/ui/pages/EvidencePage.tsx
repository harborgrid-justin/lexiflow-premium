/**
 * @module components/pages/EvidencePage
 * @category Pages
 * @description Evidence vault page - secure evidence management and chain of custody
 */

import React from "react";

import { type ViewMode } from '@/hooks/useEvidenceManager';
import { PageContainerLayout } from '@/layouts/PageContainerLayout/PageContainerLayout';
import { EvidenceDashboard } from '@/routes/evidence/components/EvidenceDashboard';


interface EvidencePageProps {
  onNavigate: (view: ViewMode) => void;
}

/**
 * EvidencePage - React 18 optimized with React.memo
 */
export const EvidencePage = React.memo<EvidencePageProps>(({ onNavigate }) => {
  return (
    <PageContainerLayout>
      <EvidenceDashboard onNavigate={onNavigate} />
    </PageContainerLayout>
  );
});
