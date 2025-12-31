/**
 * @module components/pages/EvidencePage
 * @category Pages
 * @description Evidence vault page - secure evidence management and chain of custody
 */

import React from 'react';
import { EvidenceDashboard } from '@/features/litigation/evidence/EvidenceDashboard';
import { PageContainerLayout } from '@/components/ui/layouts/PageContainerLayout/PageContainerLayout';
import { ViewMode } from '@/hooks/useEvidenceManager';

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
