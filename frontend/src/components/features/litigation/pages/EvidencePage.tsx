/**
 * @module components/pages/EvidencePage
 * @category Pages
 * @description Evidence vault page - secure evidence management and chain of custody
 */

import { EvidenceDashboard } from '@/features/litigation/evidence/EvidenceDashboard';
import { PageContainerLayout } from '@/shared/ui/layouts/PageContainerLayout/PageContainerLayout';
import { ViewMode } from '@/hooks/useEvidenceManager';
import React from "react";

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
